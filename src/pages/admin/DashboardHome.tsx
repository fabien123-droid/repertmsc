import { useAdminStats } from "@/hooks/useAdminStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, FolderOpen, Users, Eye, Download, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

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
    { title: "Total Chants", value: stats?.totalSongs || 0, icon: Music, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { title: "Catégories", value: stats?.totalCategories || 0, icon: FolderOpen, color: "text-green-500", bgColor: "bg-green-500/10" },
    { title: "Administrateurs", value: stats?.totalAdmins || 0, icon: Users, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { title: "Vues aujourd'hui", value: stats?.todayViews || 0, icon: Eye, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  ];

  const chartData = stats?.weeklyStats?.map((day) => ({
    date: new Date(day.stat_date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    vues: day.page_views,
    chants: day.songs_viewed,
    downloads: day.downloads,
    visiteurs: day.unique_visitors,
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre répertoire musical</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
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

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Vues de pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="vues" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-purple-500" />
                Téléchargements & Chants vus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="chants" name="Chants vus" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="downloads" name="Téléchargements" fill="hsl(270, 91%, 65%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Summary */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Résumé des 7 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.weeklyStats && stats.weeklyStats.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-500/10 rounded-xl">
                <div className="text-2xl font-bold text-blue-500">{stats.weeklyStats.reduce((sum, d) => sum + d.page_views, 0)}</div>
                <div className="text-sm text-muted-foreground">Vues totales</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-xl">
                <div className="text-2xl font-bold text-green-500">{stats.weeklyStats.reduce((sum, d) => sum + d.unique_visitors, 0)}</div>
                <div className="text-sm text-muted-foreground">Visiteurs uniques</div>
              </div>
              <div className="text-center p-4 bg-amber-500/10 rounded-xl">
                <div className="text-2xl font-bold text-amber-500">{stats.weeklyStats.reduce((sum, d) => sum + d.songs_viewed, 0)}</div>
                <div className="text-sm text-muted-foreground">Chants consultés</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-xl">
                <div className="text-2xl font-bold text-purple-500">{stats.weeklyStats.reduce((sum, d) => sum + d.downloads, 0)}</div>
                <div className="text-sm text-muted-foreground">Téléchargements</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune statistique disponible pour cette période</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
