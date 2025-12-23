import { useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  Music, 
  FolderOpen, 
  Users,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/admin/dashboard/songs", icon: Music, label: "Chants" },
  { to: "/admin/dashboard/categories", icon: FolderOpen, label: "Catégories" },
  { to: "/admin/dashboard/admins", icon: Users, label: "Administrateurs", superAdminOnly: true },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut, isAdmin, isSuperAdmin, role } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/admin");
    }
  }, [loading, isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <div className="w-64 border-r border-border bg-card/50 p-4">
            <Skeleton className="h-12 w-full mb-8" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-[60vh]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card/50 min-h-screen sticky top-0">
          <div className="p-4">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">Admin</h1>
                <p className="text-xs text-muted-foreground">Chorale</p>
              </div>
            </div>

            {/* User Info */}
            <div className="mb-6 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {isSuperAdmin && <Crown className="h-4 w-4 text-primary" />}
                <span className="text-xs font-medium text-primary capitalize">
                  {role === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
              <p className="text-sm truncate">{user?.email}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                if (item.superAdminOnly && !isSuperAdmin) return null;
                
                const isActive = location.pathname === item.to || 
                  (item.to !== "/admin/dashboard" && location.pathname.startsWith(item.to));
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign Out */}
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
