import { Link } from "react-router-dom";
import { Music, Download, Check, User, Heart, Headphones } from "lucide-react";
import { Song } from "@/types/database";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { isSongCached, cacheSong, removeCachedSong, isOnline } = useOfflineStorage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isCached = isSongCached(song.id);
  const favorite = isFavorite(song.id);

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

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(song.id);
    toast.success(favorite ? "Retiré des favoris" : "Ajouté aux favoris");
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
          <div className="flex items-center gap-2 mt-2">
            {song.categories && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">
                {song.categories.name}
              </span>
            )}
            {song.audio_path && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-xs text-primary">
                <Headphones className="h-3 w-3" />
                Audio
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            className={cn(
              "h-9 w-9 rounded-full",
              favorite ? "text-red-500 bg-red-500/10" : "text-muted-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCacheToggle}
            disabled={!isOnline && !isCached}
            className={cn(
              "h-9 w-9 rounded-full",
              isCached ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >
            {isCached ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Link>
  );
}
