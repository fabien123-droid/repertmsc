import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DailyStats {
  stat_date: string;
  page_views: number;
  unique_visitors: number;
  songs_viewed: number;
  downloads: number;
}

interface TotalStats {
  totalSongs: number;
  totalCategories: number;
  totalAdmins: number;
  todayViews: number;
  todayDownloads: number;
  weeklyStats: DailyStats[];
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<TotalStats> => {
      // Get songs count
      const { count: songsCount } = await supabase
        .from("songs")
        .select("*", { count: "exact", head: true });

      // Get categories count
      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      // Get admins count
      const { count: adminsCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true });

      // Get today's stats
      const today = new Date().toISOString().split("T")[0];
      const { data: todayStats } = await supabase
        .from("admin_stats")
        .select("*")
        .eq("stat_date", today)
        .maybeSingle();

      // Get last 7 days stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: weeklyData } = await supabase
        .from("admin_stats")
        .select("*")
        .gte("stat_date", weekAgo.toISOString().split("T")[0])
        .order("stat_date", { ascending: true });

      return {
        totalSongs: songsCount || 0,
        totalCategories: categoriesCount || 0,
        totalAdmins: adminsCount || 0,
        todayViews: todayStats?.page_views || 0,
        todayDownloads: todayStats?.downloads || 0,
        weeklyStats: (weeklyData as DailyStats[]) || [],
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Function to track stats (call from public pages)
export async function trackStat(statName: "page_views" | "unique_visitors" | "songs_viewed" | "downloads") {
  try {
    await supabase.rpc("increment_stat", { stat_name: statName });
  } catch (error) {
    console.error("Error tracking stat:", error);
  }
}
