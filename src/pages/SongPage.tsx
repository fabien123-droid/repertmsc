import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Check, FileText, Music2, ZoomIn, ZoomOut } from "lucide-react";
import { useSong } from "@/hooks/useSongs";
import { useOfflineStorage, getBlob } from "@/hooks/useOfflineStorage";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: song, isLoading } = useSong(id!);
  const { isSongCached, cacheSong, getCachedSong, isOnline } = useOfflineStorage();
  const [fontSize, setFontSize] = useState(18);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  const isCached = isSongCached(id!);
  const cachedSong = getCachedSong(id!);
  const displaySong = isOnline ? song : cachedSong;

  useEffect(() => {
    async function loadFile() {
      if (!displaySong?.file_path) return;
      const cachedBlob = await getBlob(displaySong.id);
      if (cachedBlob) {
        setFileUrl(URL.createObjectURL(cachedBlob));
        return;
      }
      if (isOnline) {
        const { data } = await supabase.storage.from("sheet-music").getPublicUrl(displaySong.file_path);
        setFileUrl(data.publicUrl);
      }
    }
    loadFile();
  }, [displaySong, isOnline]);

  const handleCacheSong = async () => {
    if (!song) return;
    const success = await cacheSong(song);
    if (success) toast.success("Chant téléchargé pour l'accès hors ligne");
    else toast.error("Erreur lors du téléchargement");
  };

  if (isLoading && !cachedSong) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-[60vh]" />
        </main>
      </div>
    );
  }

  if (!displaySong) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <p className="text-center text-muted-foreground">Chant non trouvé</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">{displaySong.title}</h1>
            {displaySong.author && <p className="text-lg text-muted-foreground">{displaySong.author}</p>}
            {displaySong.categories && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-primary/10 text-sm text-primary font-medium">
                {displaySong.categories.name}
              </span>
            )}
          </div>
          <Button onClick={handleCacheSong} disabled={!isOnline || isCached} variant={isCached ? "secondary" : "default"} className="shrink-0">
            {isCached ? <><Check className="h-4 w-4 mr-2" />Téléchargé</> : <><Download className="h-4 w-4 mr-2" />Télécharger</>}
          </Button>
        </div>

        <Tabs defaultValue="lyrics" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-6">
            <TabsTrigger value="lyrics" className="gap-2"><FileText className="h-4 w-4" />Paroles</TabsTrigger>
            <TabsTrigger value="sheet" className="gap-2" disabled={!displaySong.file_path}><Music2 className="h-4 w-4" />Partition</TabsTrigger>
          </TabsList>

          <TabsContent value="lyrics" className="mt-0">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <div className="flex items-center justify-end gap-2 mb-6 pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground mr-2">Taille du texte</span>
                <Button variant="outline" size="icon" onClick={() => setFontSize((s) => Math.max(12, s - 2))} className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
                <span className="w-8 text-center text-sm">{fontSize}</span>
                <Button variant="outline" size="icon" onClick={() => setFontSize((s) => Math.min(32, s + 2))} className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
              </div>
              <div className="lyrics-scroll max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                {displaySong.lyrics || <p className="text-muted-foreground italic">Aucune parole disponible</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sheet" className="mt-0">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {fileUrl ? (
                displaySong.file_path?.endsWith(".pdf") ? (
                  <iframe src={fileUrl} className="w-full h-[70vh]" title="Partition" />
                ) : (
                  <img src={fileUrl} alt="Partition" className="w-full h-auto max-h-[70vh] object-contain" />
                )
              ) : (
                <div className="flex items-center justify-center h-[40vh] text-muted-foreground">
                  <p>Aucune partition disponible</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
