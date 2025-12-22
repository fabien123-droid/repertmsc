import { useState } from "react";
import { useSongs } from "@/hooks/useSongs";
import { useCategories } from "@/hooks/useCategories";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SongCard } from "@/components/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Music } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: songs = [], isLoading: songsLoading } = useSongs(selectedCategory, searchQuery);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6">
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
            Parcourez et téléchargez les chants de votre chorale
          </p>
        </div>

        {/* Search */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} className="max-w-xl mx-auto" />

        {/* Category filters */}
        {categoriesLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-24 rounded-full" />)}
          </div>
        ) : (
          <CategoryFilter categories={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
        )}

        {/* Songs list */}
        <div className="space-y-3">
          {songsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))
          ) : songs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucun chant trouvé</p>
            </div>
          ) : (
            songs.map((song) => <SongCard key={song.id} song={song} />)
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
