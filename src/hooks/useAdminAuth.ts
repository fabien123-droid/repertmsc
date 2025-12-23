import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "admin" | "super_admin";

interface AdminInfo {
  id: string;
  user_id: string;
  role: AdminRole;
  email: string;
  created_at: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            await fetchRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setIsSuperAdmin(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role:", error);
        setRole(null);
        setIsSuperAdmin(false);
      } else if (data) {
        setRole(data.role as AdminRole);
        setIsSuperAdmin(data.role === "super_admin");
      } else {
        setRole(null);
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();
      
      if (roleError || !roleData) {
        await supabase.auth.signOut();
        return { error: { message: "Accès non autorisé. Vous n'êtes pas administrateur." } };
      }
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { error: { message: result.error } };
    }

    // Auto sign in after successful signup
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: signInResult.error, data: result };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setRole(null);
    setIsSuperAdmin(false);
    return { error };
  };

  const getAllAdmins = async (): Promise<AdminInfo[]> => {
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !roles) return [];

    // Get user emails from auth
    const admins: AdminInfo[] = [];
    for (const r of roles) {
      admins.push({
        id: r.id,
        user_id: r.user_id,
        role: r.role as AdminRole,
        email: "Chargement...",
        created_at: r.created_at,
      });
    }

    return admins;
  };

  const deleteAdmin = async (roleId: string) => {
    if (!isSuperAdmin) {
      return { error: { message: "Seuls les super administrateurs peuvent supprimer des admins" } };
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", roleId);

    return { error };
  };

  return {
    user,
    session,
    loading,
    role,
    isSuperAdmin,
    isAdmin: !!role,
    signIn,
    signUp,
    signOut,
    getAllAdmins,
    deleteAdmin,
  };
}
