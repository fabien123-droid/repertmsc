import { useAdminStats } from "@/hooks/useAdminStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, FolderOpen, Users, Eye, Download, TrendingUp } from "lucide-react";

export default function DashboardHome() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Chants",
      value: stats?.totalSongs || 0,
      icon: Music,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Catégories",
      value: stats?.totalCategories || 0,
      icon: FolderOpen,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Administrateurs",
      value: stats?.totalAdmins || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Vues aujourd'hui",
      value: stats?.todayViews || 0,
      icon: Eye,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de votre répertoire musical
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Stats */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Statistiques des 7 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.weeklyStats && stats.weeklyStats.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {stats.weeklyStats.map((day) => (
                  <div
                    key={day.stat_date}
                    className="text-center p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(day.stat_date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="text-lg font-bold">{day.page_views}</div>
                    <div className="text-xs text-muted-foreground">vues</div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {stats.weeklyStats.reduce((sum, d) => sum + d.page_views, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Vues totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {stats.weeklyStats.reduce((sum, d) => sum + d.unique_visitors, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Visiteurs uniques</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">
                    {stats.weeklyStats.reduce((sum, d) => sum + d.songs_viewed, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Chants consultés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {stats.weeklyStats.reduce((sum, d) => sum + d.downloads, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Téléchargements</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune statistique disponible pour cette période</p>
              <p className="text-sm">Les données s'afficheront une fois que des visiteurs consulteront l'application</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
