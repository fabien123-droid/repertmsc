import { AdminSongs } from "@/components/admin/AdminSongs";

export default function SongsManagement() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Gestion des chants</h1>
        <p className="text-muted-foreground mt-1">
          Ajoutez, modifiez ou supprimez les chants du répertoire
        </p>
      </div>
      <AdminSongs />
    </div>
  );
}
