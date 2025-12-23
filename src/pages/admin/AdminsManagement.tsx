import { useState, useEffect } from "react";
import { useAdminAuth, AdminRole } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Crown, Shield, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminInfo {
  id: string;
  user_id: string;
  role: AdminRole;
  email: string;
  created_at: string;
}

export default function AdminsManagement() {
  const { user, isSuperAdmin, deleteAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Map roles to admin info
      const adminList: AdminInfo[] = (roles || []).map((r, index) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role as AdminRole,
        email: `Admin #${index + 1}`, // We can't access auth.users from client
        created_at: r.created_at,
      }));

      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste des administrateurs",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    const { error } = await deleteAdmin(deleteTarget.id);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } else {
      toast({
        title: "Administrateur supprimé",
        description: "L'accès administrateur a été révoqué",
      });
      fetchAdmins();
    }
    
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  const superAdminCount = admins.filter((a) => a.role === "super_admin").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Administrateurs</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les accès administrateur de l'application
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Super Administrateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{superAdminCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Peuvent supprimer d'autres admins
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Administrateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Accès à l'administration
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Liste des administrateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin, index) => {
              const isCurrentUser = admin.user_id === user?.id;
              const canDelete = isSuperAdmin && !isCurrentUser && admin.role !== "super_admin";
              
              return (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      admin.role === "super_admin" ? "bg-primary/10" : "bg-blue-500/10"
                    }`}>
                      {admin.role === "super_admin" ? (
                        <Crown className="h-5 w-5 text-primary" />
                      ) : (
                        <Shield className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isCurrentUser ? "Vous" : `Admin #${index + 1}`}
                        </span>
                        <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
                          {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                        </Badge>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            Connecté
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Créé le {new Date(admin.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(admin)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {!isSuperAdmin && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500">Permissions limitées</p>
                <p className="text-sm text-muted-foreground">
                  Seuls les Super Administrateurs peuvent supprimer d'autres administrateurs.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet administrateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action révoquera l'accès administrateur de cet utilisateur. 
              Il ne pourra plus accéder à l'interface d'administration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
