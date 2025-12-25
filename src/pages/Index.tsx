import { useState, useMemo, useEffect } from "react";
import { useSongs } from "@/hooks/useSongs";
import { useCategories } from "@/hooks/useCategories";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SongCard } from "@/components/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, WifiOff, Download } from "lucide-react";
import { Song } from "@/types/database";

const Index = () => {
  // Track page view on mount
  useEffect(() => {
    const trackView = async () => {
      try { await supabase.rpc('increment_stat', { stat_name: 'page_views' }); } catch {}
    };
    trackView();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: onlineSongs = [], isLoading: songsLoading } = useSongs(selectedCategory, searchQuery);
  const { cachedSongs, isOnline, isLoaded } = useOfflineStorage();

  // When offline, show cached songs; when online, show online songs
  const displaySongs = useMemo(() => {
    if (isOnline) {
      return onlineSongs;
    }
    
    // Filter cached songs based on search and category
    let filtered = cachedSongs as Song[];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.author?.toLowerCase().includes(query) ||
          song.lyrics?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter((song) => song.category_id === selectedCategory);
    }
    
    return filtered;
  }, [isOnline, onlineSongs, cachedSongs, searchQuery, selectedCategory]);

  // Get unique categories from cached songs when offline
  const displayCategories = useMemo(() => {
    if (isOnline) {
      return categories;
    }
    
    const categoryMap = new Map<string, { id: string; name: string }>();
    cachedSongs.forEach((song) => {
      if (song.categories && song.category_id) {
        categoryMap.set(song.category_id, {
          id: song.category_id,
          name: song.categories.name,
        });
      }
    });
    
    return Array.from(categoryMap.values());
  }, [isOnline, categories, cachedSongs]);

  const isLoading = isOnline ? (songsLoading || categoriesLoading) : !isLoaded;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <WifiOff className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-500">Mode hors-ligne</p>
              <p className="text-sm text-muted-foreground">
                Vous consultez vos {cachedSongs.length} chant{cachedSongs.length > 1 ? 's' : ''} téléchargé{cachedSongs.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Hero section */}
        <div className="text-center py-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-glow-pulse">
              <Music className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Répertoire Musical
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {isOnline 
              ? "Parcourez et téléchargez les chants de votre chorale"
              : "Accédez à vos chants téléchargés"
            }
          </p>
        </div>

        {/* Search */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} className="max-w-xl mx-auto" />

        {/* Category filters */}
        {isLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-24 rounded-full" />)}
          </div>
        ) : displayCategories.length > 0 ? (
          <CategoryFilter 
            categories={displayCategories} 
            selectedId={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        ) : null}

        {/* Songs list */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))
          ) : displaySongs.length === 0 ? (
            <div className="text-center py-12">
              {!isOnline && cachedSongs.length === 0 ? (
                <>
                  <Download className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">Aucun chant téléchargé</p>
                  <p className="text-sm text-muted-foreground">
                    Connectez-vous à Internet et téléchargez des chants pour les consulter hors-ligne
                  </p>
                </>
              ) : (
                <>
                  <Music className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun chant trouvé</p>
                </>
              )}
            </div>
          ) : (
            displaySongs.map((song) => <SongCard key={song.id} song={song} />)
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
