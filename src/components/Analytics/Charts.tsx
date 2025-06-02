"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartErrorBoundary } from "./ErrorBoundary";
import { Activity, Clock, Eye, FileText, Users, Heart } from 'lucide-react';
import type { AnalyticsData } from "@/lib/analytics";

export function MaterialsStatusChart({ data }: { data: AnalyticsData['materialsStatus'] }) {
  const chartData = [
    { name: 'Disponibles', value: data.available, color: '#00C49F' },
    { name: 'No Disponibles', value: data.unavailable, color: '#FF8042' },
    { name: 'Pendientes', value: data.pending, color: '#FFBB28' },
  ];

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Estado de Materiales</CardTitle>
          <CardDescription>Distribución de materiales por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

export function UserGrowthChart({ data }: { data: AnalyticsData['userGrowth'] }) {
  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Crecimiento de Usuarios</CardTitle>
          <CardDescription>Usuarios registrados por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#0088FE" 
                fill="#0088FE"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

export function MaterialsByTagChart({ data }: { data: AnalyticsData['materialsByTag'] }) {
  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Materiales por Categoría</CardTitle>
          <CardDescription>Distribución de materiales por tags</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

export function MaterialsByStatusChart({ data }: { data: AnalyticsData['materialsByStatus'] }) {
  const chartData = [
    { name: 'Publicados', value: data.published, color: '#00C49F' },
    { name: 'Borradores', value: data.draft, color: '#FFBB28' },
    { name: 'Archivados', value: data.archived, color: '#FF8042' },
  ];

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Estatus de Publicación</CardTitle>
          <CardDescription>Estado de publicación de materiales</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

export function RecentActivityCard({ data }: { data: AnalyticsData['recentActivity'] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'material':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'favorite':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 border-blue-200';
      case 'material':
        return 'bg-green-50 border-green-200';
      case 'favorite':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>Últimas acciones en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((activity, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(activity.timestamp).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PopularMaterialsTable({ data }: { data: AnalyticsData['popularMaterials'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materiales Más Populares</CardTitle>
        <CardDescription>Top materiales con más favoritos y visualizaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((material, index) => (
            <div key={material.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <div>
                  <p className="font-medium text-sm">{material.nombre}</p>
                  <p className="text-xs text-muted-foreground">Por: {material.autores}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {material.visualizaciones && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{material.visualizaciones}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">{material.favoritos}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 