import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/database";
import { toast } from "sonner";

export function useSongs(categoryId?: string | null, searchQuery?: string) {
  return useQuery({
    queryKey: ["songs", categoryId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("songs")
        .select(`
          *,
          categories (*)
        `)
        .order("title");
      
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Song[];
    },
  });
}

export function useSong(id: string) {
  return useQuery({
    queryKey: ["song", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(`
          *,
          categories (*)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Song;
    },
    enabled: !!id,
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (song: {
      title: string;
      author?: string;
      lyrics?: string;
      category_id?: string;
      file_path?: string;
    }) => {
      const { data, error } = await supabase
        .from("songs")
        .insert(song)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Chant ajouté avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...song }: {
      id: string;
      title?: string;
      author?: string;
      lyrics?: string;
      category_id?: string | null;
      file_path?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("songs")
        .update(song)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["song"] });
      toast.success("Chant mis à jour");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get the song to check for file
      const { data: song } = await supabase
        .from("songs")
        .select("file_path")
        .eq("id", id)
        .single();
      
      // Delete the file if exists
      if (song?.file_path) {
        await supabase.storage
          .from("sheet-music")
          .remove([song.file_path]);
      }
      
      const { error } = await supabase
        .from("songs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Chant supprimé");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
