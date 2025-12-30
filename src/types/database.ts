export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  author: string | null;
  lyrics: string | null;
  category_id: string | null;
  file_path: string | null;
  audio_path: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
}

export interface CachedSong extends Song {
  cachedAt: number;
  fileBlob?: Blob;
  audioBlob?: Blob;
}
