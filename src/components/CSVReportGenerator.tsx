"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useState } from "react";
import type { AnalyticsData } from "@/lib/analytics";

interface CSVReportGeneratorProps {
  analyticsData: AnalyticsData;
}

export default function CSVReportGenerator({
  analyticsData,
}: CSVReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value?.toString() || "";
      }).join(",")
    );
    
    return [csvHeaders, ...csvRows].join("\n");
  };

  const generateCSV = async () => {
    setIsGenerating(true);
    
    try {
      let csvContent = "";
      
      // 1. Resumen General
      csvContent += "RESUMEN GENERAL\n";
      csvContent += "Métrica,Valor\n";
      csvContent += `Total Usuarios,${analyticsData.totalUsers}\n`;
      csvContent += `Total Materiales,${analyticsData.totalMaterials}\n`;
      csvContent += `Total Tags,${analyticsData.totalTags}\n`;
      csvContent += `Materiales Publicados,${analyticsData.materialsByStatus.published}\n`;
      csvContent += `Materiales en Borrador,${analyticsData.materialsByStatus.draft}\n`;
      csvContent += `Materiales Archivados,${analyticsData.materialsByStatus.archived}\n`;
      csvContent += `Materiales Disponibles,${analyticsData.materialsStatus.available}\n`;
      csvContent += `Materiales No Disponibles,${analyticsData.materialsStatus.unavailable}\n`;
      csvContent += `Materiales Pendientes,${analyticsData.materialsStatus.pending}\n`;
      csvContent += "\n";

      // 2. Resumen Detallado
      if (analyticsData.detailedAnalytics.resumen) {
        csvContent += "RESUMEN DETALLADO\n";
        csvContent += "Métrica,Valor\n";
        csvContent += `Total Consultas Histórico,${analyticsData.detailedAnalytics.resumen.totalConsultasHistorico}\n`;
        csvContent += `Total Carreras Consultadas,${analyticsData.detailedAnalytics.resumen.totalCarrerasConsultadas}\n`;
        csvContent += `Total Semestres Consultados,${analyticsData.detailedAnalytics.resumen.totalSemestresConsultados}\n`;
        csvContent += `Total Materias Consultadas,${analyticsData.detailedAnalytics.resumen.totalMateriasConsultadas}\n`;
        csvContent += `Total Autores Consultados,${analyticsData.detailedAnalytics.resumen.totalAutoresConsultados}\n`;
        csvContent += `Total Materiales Consultados,${analyticsData.detailedAnalytics.resumen.totalMaterialesConsultados}\n`;
        csvContent += `Carrera Más Consultada,${analyticsData.detailedAnalytics.resumen.carreraMasConsultada}\n`;
        csvContent += `Autor Más Consultado,${analyticsData.detailedAnalytics.resumen.autorMasConsultado}\n`;
        csvContent += `Material Más Consultado,${analyticsData.detailedAnalytics.resumen.materialMasConsultado}\n`;
        csvContent += "\n";
      }

      // 3. Crecimiento de Usuarios
      if (analyticsData.userGrowth.length > 0) {
        csvContent += "CRECIMIENTO DE USUARIOS\n";
        csvContent += convertToCSV(analyticsData.userGrowth);
        csvContent += "\n\n";
      }

      // 4. Top Carreras
      if (analyticsData.detailedAnalytics.topCarreras.length > 0) {
        csvContent += "TOP CARRERAS\n";
        csvContent += convertToCSV(analyticsData.detailedAnalytics.topCarreras);
        csvContent += "\n\n";
      }

      // 5. Top Semestres
      if (analyticsData.detailedAnalytics.topSemestres.length > 0) {
        csvContent += "TOP SEMESTRES\n";
        csvContent += convertToCSV(analyticsData.detailedAnalytics.topSemestres);
        csvContent += "\n\n";
      }

      // 6. Top Materias
      if (analyticsData.detailedAnalytics.topMaterias.length > 0) {
        csvContent += "TOP MATERIAS\n";
        csvContent += convertToCSV(analyticsData.detailedAnalytics.topMaterias);
        csvContent += "\n\n";
      }

      // 7. Top Autores
      if (analyticsData.detailedAnalytics.topAutores.length > 0) {
        csvContent += "TOP AUTORES\n";
        csvContent += convertToCSV(analyticsData.detailedAnalytics.topAutores);
        csvContent += "\n\n";
      }

      // 8. Top Materiales
      if (analyticsData.detailedAnalytics.topMateriales.length > 0) {
        csvContent += "TOP MATERIALES\n";
        csvContent += convertToCSV(analyticsData.detailedAnalytics.topMateriales);
        csvContent += "\n\n";
      }

      // 9. Materiales Populares
      if (analyticsData.popularMaterials.length > 0) {
        csvContent += "MATERIALES POPULARES\n";
        csvContent += convertToCSV(analyticsData.popularMaterials);
        csvContent += "\n\n";
      }

      // 10. Materiales por Tag
      if (analyticsData.materialsByTag.length > 0) {
        csvContent += "MATERIALES POR TAG\n";
        csvContent += convertToCSV(analyticsData.materialsByTag);
        csvContent += "\n\n";
      }

      // Create and download CSV file with UTF-8 BOM for proper Excel encoding
      const BOM = '\uFEFF'; // UTF-8 BOM
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const fileName = `reporte-analytics-${new Date().toISOString().split("T")[0]}.csv`;
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Error al generar el reporte CSV. Por favor, inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={generateCSV} disabled={isGenerating}>
      <FileDown className="h-4 w-4 mr-2" />
      {isGenerating ? "Generando..." : "Generar reporte CSV"}
    </Button>
  );
} 