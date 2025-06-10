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
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartErrorBoundary } from "./ErrorBoundary";
import { Eye, GraduationCap, BookOpen, User } from "lucide-react";
import type {
  AnalyticsData,
  TopAutor,
  TopCarrera,
  TopSemestre,
  MaterialsByCreator,
} from "@/lib/analytics";

export function MaterialsStatusChart({
  data,
}: {
  data: AnalyticsData["materialsStatus"];
}) {
  const chartData = [
    { name: "Disponibles", value: data.available, color: "#00C49F" },
    { name: "No Disponibles", value: data.unavailable, color: "#FF8042" },
    { name: "Pendientes", value: data.pending, color: "#FFBB28" },
  ];

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Estado de Materiales</CardTitle>
          <CardDescription>
            Distribución de materiales por estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
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

export function UserGrowthChart({
  data,
}: {
  data: AnalyticsData["userGrowth"];
}) {
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

export function MaterialsByTagChart({
  data,
}: {
  data: AnalyticsData["materialsByTag"];
}) {
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

export function MaterialsByStatusChart({
  data,
}: {
  data: AnalyticsData["materialsByStatus"];
}) {
  const chartData = [
    { name: "Publicados", value: data.published, color: "#00C49F" },
    { name: "Pendientes", value: data.draft, color: "#FFBB28" },
    { name: "No disponible", value: data.archived, color: "#FF8042" },
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

export function PopularMaterialsTable({
  data,
}: {
  data: AnalyticsData["popularMaterials"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materiales Más Consultados</CardTitle>
        <CardDescription>Listado con más visualizaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((material, index) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <div>
                  <p className="font-medium text-sm">{material.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    Subido por: {material.autores}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {material.visualizaciones && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{material.visualizaciones}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// New chart components for the analytics endpoint data

export function TopAutoresList({ data }: { data: TopAutor[] }) {
  // Sort by totalConsultas descending and take top 10
  const sortedAutores = data
    .sort((a, b) => b.totalConsultas - a.totalConsultas)
    .slice(0, 10);

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Autores
          </CardTitle>
          <CardDescription>
            Autores con más consultas de materiales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedAutores.map((autor, index) => (
              <div
                key={autor.autorId}
                className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Badge
                      variant={index === 0 ? "default" : "secondary"}
                      className={
                        index === 0 ? "bg-yellow-500 text-yellow-50" : ""
                      }
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {autor.nombreCompleto}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {autor.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Última consulta:{" "}
                      {new Date(autor.ultimaConsulta).toLocaleDateString(
                        "es-ES"
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {autor.totalConsultas.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {autor.porcentajeDelTotal.toFixed(1)}% del total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

export function TopCarrerasChart({ data }: { data: TopCarrera[] }) {
  const chartData = data.map((carrera, index) => ({
    name: carrera.nombreCarrera,
    value: carrera.totalConsultas,
    porcentaje: carrera.porcentajeDelTotal,
    color: `hsl(${(index * 60) % 360}, 70%, 60%)`,
  }));

  const renderCustomizedLabel = ({ name, porcentaje }: any) => {
    return `${porcentaje.toFixed(1)}%`;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          const item = chartData.find((d) => d.name === entry.value);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {entry.value}: {item?.porcentaje.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Carreras
          </CardTitle>
          <CardDescription>
            Distribución de consultas por carrera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="40%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${value} consultas`,
                  "Total de Consultas",
                ]}
              />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

export function TopSemestresChart({ data }: { data: TopSemestre[] }) {
  // Use percentage values for better visualization when there are large differences
  const chartData = data.map((semestre) => ({
    name: semestre.nombreSemestre.replace("semestre", "sem."),
    fullName: semestre.nombreSemestre,
    totalConsultas: semestre.totalConsultas,
    porcentaje: semestre.porcentajeDelTotal,
    // Use percentage for the chart to normalize the differences
    displayValue: semestre.porcentajeDelTotal,
  }));

  // Define colors for each bar
  const colors = [
    "#8884d8",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#0088FE",
    "#82ca9d",
  ];

  // Calculate the maximum percentage value and add some padding
  const maxPercentage = Math.max(...chartData.map((d) => d.displayValue));
  const yAxisMax = Math.min(100, Math.ceil(maxPercentage * 1.1)); // Add 10% padding but cap at 100%

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Semestres
          </CardTitle>
          <CardDescription>
            Distribución porcentual de consultas por semestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                domain={[0, yAxisMax]}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}% (${chartData.find((d) => d.displayValue === value)?.totalConsultas || 0} consultas)`,
                  "Porcentaje del Total",
                ]}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.name === label);
                  return item ? item.fullName : label;
                }}
              />
              <Bar dataKey="displayValue" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

export function MaterialsByCreatorTable({
  data,
}: {
  data: MaterialsByCreator[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Materiales por Creador
        </CardTitle>
        <CardDescription>
          Usuarios con más materiales contribuidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((creator, index) => (
            <div
              key={creator.usuarioId}
              className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Badge
                    variant={index === 0 ? "default" : "secondary"}
                    className={
                      index === 0 ? "bg-yellow-500 text-yellow-50" : ""
                    }
                  >
                    #{index + 1}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{creator.nombreCompleto}</p>
                  <p className="text-xs text-muted-foreground">
                    {creator.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {creator.cantidadMateriales}
                </div>
                <div className="text-xs text-muted-foreground">
                  {creator.porcentajeDelTotal.toFixed(1)}% del total
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
