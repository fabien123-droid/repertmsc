import { Link, useLocation } from "react-router-dom";
import { Music, Settings, Download, Wifi, WifiOff } from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const { isOnline, cachedSongs } = useOfflineStorage();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Music className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold tracking-tight">Chorale</span>
            <span className="text-xs text-muted-foreground -mt-0.5">Répertoire Musical</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Offline indicator */}
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
            isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
          )}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span className="hidden sm:inline">{isOnline ? "En ligne" : "Hors ligne"}</span>
          </div>

          {/* Cached songs count */}
          {cachedSongs.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
              <Download className="h-3 w-3" />
              <span>{cachedSongs.length}</span>
            </div>
          )}

          {/* Admin link */}
          <Link
            to={isAdmin ? "/" : "/admin"}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isAdmin 
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{isAdmin ? "Accueil" : "Admin"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
