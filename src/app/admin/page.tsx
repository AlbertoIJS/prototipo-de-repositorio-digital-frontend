import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchAnalyticsData,
  fetchSystemHealth,
  type AnalyticsData,
} from "@/lib/analytics";
import {
  MaterialsStatusChart,
  UserGrowthChart,
  MaterialsByTagChart,
  MaterialsByStatusChart,
  RecentActivityCard,
  PopularMaterialsTable,
} from "@/components/Analytics/Charts";
import {
  Users,
  FileText,
  Tags,
  Heart,
  TrendingUp,
  Activity,
  Eye,
  Clock,
  UserCheck,
  BarChart3,
  Settings,
  Download,
} from "lucide-react";
import Link from "next/link";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "text-blue-500",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div
            className={`flex items-center text-xs mt-1 ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.isPositive ? "+" : ""}
            {trend.value}% vs mes anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    {
      icon: Users,
      label: "Gestionar Usuarios",
      href: "/admin/usuarios",
      color: "text-blue-500",
      bg: "hover:bg-blue-50",
    },
    // TODO: Add page to manage materials (CRUD) it must let the admin change status and url
    {
      icon: FileText,
      label: "Revisar Materiales",
      href: "/admin/materiales",
      color: "text-green-500",
      bg: "hover:bg-green-50",
    },
    // TODO: Add page to manage tags (CRUD)
    {
      icon: Tags,
      label: "Gestionar Categorías",
      href: "/admin/categorias",
      color: "text-purple-500",
      bg: "hover:bg-purple-50",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Operaciones administrativas comunes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Link
              key={index}
              className={`flex items-center space-x-2 p-3 rounded-lg border ${action.bg} cursor-pointer transition-colors`}
              href={action.href}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Admin() {
  const [analyticsData, systemHealth] = await Promise.all([
    fetchAnalyticsData(),
    fetchSystemHealth(),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Gestiona y monitorea el repositorio de materiales académicos
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Usuarios"
          value={analyticsData.totalUsers}
          description="Usuarios registrados en el sistema"
          icon={Users}
          color="text-blue-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Usuarios Activos"
          value={analyticsData.activeUsers}
          description="Usuarios con actividad reciente"
          icon={UserCheck}
          color="text-green-500"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Materiales"
          value={analyticsData.totalMaterials}
          description="Materiales en el repositorio"
          icon={FileText}
          color="text-purple-500"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Total Favoritos"
          value={analyticsData.totalFavorites}
          description="Materiales marcados como favoritos"
          icon={Heart}
          color="text-red-500"
          trend={{ value: 22, isPositive: true }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Categorías"
          value={analyticsData.totalTags}
          description="Tags de clasificación"
          icon={Tags}
          color="text-orange-500"
        />
        <StatCard
          title="Materiales Publicados"
          value={analyticsData.materialsByStatus.published}
          description="Materiales disponibles públicamente"
          icon={Eye}
          color="text-green-600"
        />
        <StatCard
          title="Materiales Pendientes"
          value={analyticsData.materialsByStatus.draft}
          description="Materiales en revisión"
          icon={Clock}
          color="text-yellow-600"
        />
      </div>

      {/* Charts Row 1 - Main Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <UserGrowthChart data={analyticsData.userGrowth} />
      </div>

      {/* Charts Row 2 - Distribution and Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <MaterialsByTagChart data={analyticsData.materialsByTag} />
        <MaterialsByStatusChart data={analyticsData.materialsByStatus} />
      </div>

      {/* Content Row - Activity and Popular Materials */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PopularMaterialsTable data={analyticsData.popularMaterials} />
        </div>
        <div className="space-y-6">
          <RecentActivityCard data={analyticsData.recentActivity} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
