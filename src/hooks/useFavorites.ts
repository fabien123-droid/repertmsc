import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "chorale_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, []);

  const toggleFavorite = useCallback((songId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId];
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((songId: string) => {
    return favorites.includes(songId);
  }, [favorites]);

  const getFavoriteIds = useCallback(() => {
    return favorites;
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteIds,
  };
}
