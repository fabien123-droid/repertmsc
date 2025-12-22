import { Link } from "react-router-dom";
import { Music, Download, Check, User } from "lucide-react";
import { Song } from "@/types/database";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { isSongCached, cacheSong, removeCachedSong, isOnline } = useOfflineStorage();
  const isCached = isSongCached(song.id);

  const handleCacheToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCached) {
      removeCachedSong(song.id);
      toast.success("Chant retiré du cache");
    } else {
      const success = await cacheSong(song);
      if (success) {
        toast.success("Chant téléchargé pour l'accès hors ligne");
      } else {
        toast.error("Erreur lors du téléchargement");
      }
    }
  };

  return (
    <Link
      to={`/song/${song.id}`}
      className={cn(
        "group block p-4 rounded-2xl border border-border bg-card",
        "transition-all duration-300",
        "hover:border-primary/30 hover:shadow-card hover:scale-[1.02]",
        "animate-fade-in"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Music className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold truncate group-hover:text-primary transition-colors">
            {song.title}
          </h3>
          {song.author && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{song.author}</span>
            </div>
          )}
          {song.categories && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">
              {song.categories.name}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCacheToggle}
          disabled={!isOnline && !isCached}
          className={cn(
            "shrink-0 h-10 w-10 rounded-full",
            isCached ? "text-primary bg-primary/10" : "text-muted-foreground"
          )}
        >
          {isCached ? <Check className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </Button>
      </div>
    </Link>
  );
}
