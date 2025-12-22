import { useState } from "react";
import { useSongs, useCreateSong, useUpdateSong, useDeleteSong } from "@/hooks/useSongs";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { Song } from "@/types/database";
import { toast } from "sonner";

export function AdminSongs() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: songs = [], isLoading } = useSongs(null, search);
  const { data: categories = [] } = useCategories();
  const createSong = useCreateSong();
  const updateSong = useUpdateSong();
  const deleteSong = useDeleteSong();

  const [form, setForm] = useState({ title: "", author: "", lyrics: "", category_id: "", file_path: "" });

  const handleOpen = (song?: Song) => {
    if (song) {
      setEditingSong(song);
      setForm({ title: song.title, author: song.author || "", lyrics: song.lyrics || "", category_id: song.category_id || "", file_path: song.file_path || "" });
    } else {
      setEditingSong(null);
      setForm({ title: "", author: "", lyrics: "", category_id: "", file_path: "" });
    }
    setIsOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("sheet-music").upload(path, file);
    if (error) { toast.error("Erreur upload"); setUploading(false); return; }
    setForm((f) => ({ ...f, file_path: path }));
    toast.success("Fichier uploadé");
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Titre requis"); return; }
    const data = { title: form.title.trim(), author: form.author.trim() || undefined, lyrics: form.lyrics.trim() || undefined, category_id: form.category_id || undefined, file_path: form.file_path || undefined };
    if (editingSong) await updateSong.mutateAsync({ id: editingSong.id, ...data });
    else await createSong.mutateAsync(data);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher..." className="w-full sm:max-w-xs" />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button onClick={() => handleOpen()}><Plus className="h-4 w-4 mr-2" />Ajouter</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingSong ? "Modifier" : "Ajouter"} un chant</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Titre *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Auteur</Label><Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} /></div>
              <div><Label>Catégorie</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Paroles</Label><Textarea value={form.lyrics} onChange={(e) => setForm((f) => ({ ...f, lyrics: e.target.value }))} rows={6} /></div>
              <div><Label>Partition (PDF/Image)</Label>
                <div className="flex gap-2 items-center">
                  <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} disabled={uploading} />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {form.file_path && <p className="text-xs text-muted-foreground mt-1">Fichier: {form.file_path}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={createSong.isPending || updateSong.isPending}>
                {(createSong.isPending || updateSong.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editingSong ? "Mettre à jour" : "Ajouter"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {isLoading ? <p className="text-muted-foreground">Chargement...</p> : songs.length === 0 ? <p className="text-muted-foreground">Aucun chant</p> : songs.map((song) => (
          <div key={song.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <p className="font-medium">{song.title}</p>
              <p className="text-sm text-muted-foreground">{song.author} {song.categories && `• ${song.categories.name}`}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleOpen(song)}><Edit className="h-4 w-4" /></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Supprimer ce chant ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteSong.mutate(song.id)}>Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
