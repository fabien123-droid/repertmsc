import { useState, useEffect, useCallback } from "react";
import { Song, CachedSong } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "chorale_cached_songs";
const DB_NAME = "chorale_blobs";
const STORE_NAME = "files";

export function useOfflineStorage() {
  const [cachedSongs, setCachedSongs] = useState<CachedSong[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load cached songs from localStorage
    const loadCachedSongs = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const songs = JSON.parse(cached) as CachedSong[];
          setCachedSongs(songs);
        }
      } catch (error) {
        console.error("Error loading cached songs:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCachedSongs();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const cacheSong = useCallback(async (song: Song) => {
    try {
      let fileBlob: Blob | undefined;
      
      // Download file if exists
      if (song.file_path) {
        const { data } = await supabase.storage
          .from("sheet-music")
          .download(song.file_path);
        
        if (data) {
          fileBlob = data;
        }
      }

      // Create cached song with all necessary data
      const cachedSong: CachedSong = {
        id: song.id,
        title: song.title,
        author: song.author,
        lyrics: song.lyrics,
        file_path: song.file_path,
        category_id: song.category_id,
        created_at: song.created_at,
        updated_at: song.updated_at,
        categories: song.categories,
        cachedAt: Date.now(),
      };

      const newCachedSongs = [
        ...cachedSongs.filter((s) => s.id !== song.id),
        cachedSong,
      ];

      // Store metadata in localStorage
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCachedSongs));
      
      // Store blob separately in IndexedDB
      if (fileBlob) {
        await storeBlob(song.id, fileBlob);
      }

      setCachedSongs(newCachedSongs);
      return true;
    } catch (error) {
      console.error("Error caching song:", error);
      return false;
    }
  }, [cachedSongs]);

  const removeCachedSong = useCallback((songId: string) => {
    const newCachedSongs = cachedSongs.filter((s) => s.id !== songId);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCachedSongs));
    removeBlob(songId);
    setCachedSongs(newCachedSongs);
  }, [cachedSongs]);

  const isSongCached = useCallback((songId: string) => {
    return cachedSongs.some((s) => s.id === songId);
  }, [cachedSongs]);

  const getCachedSong = useCallback((songId: string) => {
    return cachedSongs.find((s) => s.id === songId);
  }, [cachedSongs]);

  const getAllCachedSongs = useCallback(() => {
    return cachedSongs;
  }, [cachedSongs]);

  return {
    cachedSongs,
    cacheSong,
    removeCachedSong,
    isSongCached,
    getCachedSong,
    getAllCachedSongs,
    isOnline,
    isLoaded,
  };
}

// IndexedDB helpers for blob storage
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
  });
}

async function storeBlob(songId: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, songId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function removeBlob(songId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(songId);
  } catch (error) {
    console.error("Error removing blob:", error);
  }
}

export async function getBlob(songId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(songId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}
