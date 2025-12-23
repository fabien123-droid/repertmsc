-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Create function to count admins
CREATE OR REPLACE FUNCTION public.count_admins()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.user_roles
$$;

-- Create function to auto-assign admin role on signup
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.user_roles;
  
  -- First 2 admins get super_admin role
  IF admin_count < 2 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign admin role (will be called manually from edge function)
-- We don't use auth trigger because we need control over who gets admin

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can delete other admins"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') 
  AND user_id != auth.uid()
);

-- Create admin_stats table for tracking
CREATE TABLE public.admin_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    page_views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    songs_viewed INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (stat_date)
);

-- Enable RLS on admin_stats
ALTER TABLE public.admin_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view stats"
ON public.admin_stats
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert/update stats"
ON public.admin_stats
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create function to increment stats
CREATE OR REPLACE FUNCTION public.increment_stat(stat_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_stats (stat_date, page_views, unique_visitors, songs_viewed, downloads)
  VALUES (CURRENT_DATE, 
    CASE WHEN stat_name = 'page_views' THEN 1 ELSE 0 END,
    CASE WHEN stat_name = 'unique_visitors' THEN 1 ELSE 0 END,
    CASE WHEN stat_name = 'songs_viewed' THEN 1 ELSE 0 END,
    CASE WHEN stat_name = 'downloads' THEN 1 ELSE 0 END
  )
  ON CONFLICT (stat_date) DO UPDATE SET
    page_views = admin_stats.page_views + CASE WHEN stat_name = 'page_views' THEN 1 ELSE 0 END,
    unique_visitors = admin_stats.unique_visitors + CASE WHEN stat_name = 'unique_visitors' THEN 1 ELSE 0 END,
    songs_viewed = admin_stats.songs_viewed + CASE WHEN stat_name = 'songs_viewed' THEN 1 ELSE 0 END,
    downloads = admin_stats.downloads + CASE WHEN stat_name = 'downloads' THEN 1 ELSE 0 END;
END;
$$;