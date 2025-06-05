"use client";

import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FileDown } from "lucide-react";
import { useState } from "react";
import type { AnalyticsData } from "@/lib/analytics";

interface PDFReportGeneratorProps {
  analyticsData: AnalyticsData;
}

export default function PDFReportGenerator({
  analyticsData,
}: PDFReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    const originalStylesheets: { element: HTMLStyleElement | HTMLLinkElement; disabled: boolean }[] = [];
    
    try {
      const contentElement = document.querySelector('[data-pdf-content]') as HTMLElement;
      
      if (!contentElement) {
        throw new Error('No se encontró el contenido para capturar');
      }

      const allStyleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
      allStyleElements.forEach((element) => {
        const typedElement = element as HTMLStyleElement | HTMLLinkElement;
        originalStylesheets.push({
          element: typedElement,
          disabled: typedElement.disabled || false
        });
        typedElement.disabled = true;
      });

      const safeStyle = document.createElement('style');
      safeStyle.id = 'pdf-safe-styles';
      safeStyle.textContent = `
        /* Reset all styles to safe defaults */
        [data-pdf-content] * {
          margin: 0;
          padding: 0;
          border: 0;
          font-size: 100%;
          font: inherit;
          vertical-align: baseline;
          box-sizing: border-box;
          color: rgb(0, 0, 0) !important;
          background: transparent !important;
          border-color: rgb(229, 231, 235) !important;
        }

        /* Basic layout styles */
        [data-pdf-content] {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
          background: white !important;
          padding: 0;
          color: rgb(0, 0, 0);
        }

        /* Container and spacing */
        [data-pdf-content] > div {
          width: 100%;
        }

        /* Grid layouts */
        [data-pdf-content] .grid {
          display: grid !important;
          gap: 16px;
        }
        
        [data-pdf-content] .grid-cols-2 {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        
        [data-pdf-content] .grid-cols-3 {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        
        [data-pdf-content] .grid-cols-4 {
          grid-template-columns: repeat(4, 1fr) !important;
        }

        [data-pdf-content] .gap-4 {
          gap: 16px !important;
        }
        
        [data-pdf-content] .gap-6 {
          gap: 24px !important;
        }

        /* Responsive grid */
        @media (min-width: 768px) {
          [data-pdf-content] .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          [data-pdf-content] .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (min-width: 1024px) {
          [data-pdf-content] .lg\\:grid-cols-4 {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        /* Flex layouts */
        [data-pdf-content] .flex {
          display: flex !important;
        }
        
        [data-pdf-content] .flex-row {
          flex-direction: row !important;
        }
        
        [data-pdf-content] .flex-col {
          flex-direction: column !important;
        }
        
        [data-pdf-content] .justify-between {
          justify-content: space-between !important;
        }
        
        [data-pdf-content] .items-center {
          align-items: center !important;
        }

        [data-pdf-content] .flex-1 {
          flex: 1 1 0% !important;
        }

        [data-pdf-content] .flex-shrink-0 {
          flex-shrink: 0 !important;
        }

        /* Spacing utilities */
        [data-pdf-content] .space-y-6 > * + * {
          margin-top: 24px !important;
        }
        
        [data-pdf-content] .space-y-4 > * + * {
          margin-top: 16px !important;
        }
        
        [data-pdf-content] .space-y-2 > * + * {
          margin-top: 8px !important;
        }

        [data-pdf-content] .space-y-3 > * + * {
          margin-top: 12px !important;
        }

        [data-pdf-content] .space-x-2 > * + * {
          margin-left: 8px !important;
        }

        [data-pdf-content] .space-x-3 > * + * {
          margin-left: 12px !important;
        }

        [data-pdf-content] .space-x-4 > * + * {
          margin-left: 16px !important;
        }

        /* Margin utilities */
        [data-pdf-content] .mt-1 { margin-top: 4px !important; }
        [data-pdf-content] .mt-2 { margin-top: 8px !important; }
        [data-pdf-content] .mt-4 { margin-top: 16px !important; }
        [data-pdf-content] .mb-2 { margin-bottom: 8px !important; }
        [data-pdf-content] .mb-4 { margin-bottom: 16px !important; }
        [data-pdf-content] .mr-1 { margin-right: 4px !important; }
        [data-pdf-content] .mr-2 { margin-right: 8px !important; }

        /* Padding utilities */
        [data-pdf-content] .p-1 { padding: 4px !important; }
        [data-pdf-content] .p-2 { padding: 8px !important; }
        [data-pdf-content] .p-3 { padding: 12px !important; }
        [data-pdf-content] .p-4 { padding: 16px !important; }
        [data-pdf-content] .p-6 { padding: 24px !important; }
        [data-pdf-content] .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
        [data-pdf-content] .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
        [data-pdf-content] .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
        [data-pdf-content] .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
        [data-pdf-content] .pb-2 { padding-bottom: 8px !important; }

        /* Card components */
        [data-pdf-content] [class*="card"] {
          background: rgb(255, 255, 255) !important;
          border: 1px solid rgb(229, 231, 235) !important;
          border-radius: 8px !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
          transition: box-shadow 0.2s !important;
          overflow: hidden;
        }

        [data-pdf-content] [class*="card"]:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }

        /* Card header and content */
        [data-pdf-content] [class*="CardHeader"] {
          padding: 24px 24px 16px 24px !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        [data-pdf-content] [class*="CardContent"] {
          padding: 0 24px 24px 24px !important;
        }

        [data-pdf-content] [class*="CardTitle"] {
          font-size: 14px !important;
          font-weight: 500 !important;
          color: rgb(0, 0, 0) !important;
        }

        [data-pdf-content] [class*="CardDescription"] {
          font-size: 12px !important;
          color: rgb(107, 114, 126) !important;
          margin-top: 4px !important;
        }

        /* Text sizes and weights */
        [data-pdf-content] .text-3xl {
          font-size: 30px !important;
          font-weight: bold !important;
          line-height: 1.2 !important;
        }
        
        [data-pdf-content] .text-2xl {
          font-size: 24px !important;
          font-weight: bold !important;
          line-height: 1.3 !important;
        }
        
        [data-pdf-content] .text-xl {
          font-size: 20px !important;
          font-weight: bold !important;
          line-height: 1.4 !important;
        }
        
        [data-pdf-content] .text-lg {
          font-size: 18px !important;
          font-weight: 600 !important;
          line-height: 1.4 !important;
        }
        
        [data-pdf-content] .text-sm {
          font-size: 14px !important;
          line-height: 1.4 !important;
        }
        
        [data-pdf-content] .text-xs {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }

        /* Font weights */
        [data-pdf-content] .font-bold {
          font-weight: bold !important;
        }
        
        [data-pdf-content] .font-medium {
          font-weight: 500 !important;
        }

        [data-pdf-content] .font-semibold {
          font-weight: 600 !important;
        }

        /* Colors - Safe RGB only */
        [data-pdf-content] .text-blue-500 {
          color: rgb(59, 130, 246) !important;
        }
        
        [data-pdf-content] .text-green-500 {
          color: rgb(34, 197, 94) !important;
        }
        
        [data-pdf-content] .text-purple-500 {
          color: rgb(168, 85, 247) !important;
        }
        
        [data-pdf-content] .text-red-500 {
          color: rgb(239, 68, 68) !important;
        }
        
        [data-pdf-content] .text-orange-500 {
          color: rgb(249, 115, 22) !important;
        }
        
        [data-pdf-content] .text-green-600 {
          color: rgb(22, 163, 74) !important;
        }
        
        [data-pdf-content] .text-yellow-600 {
          color: rgb(202, 138, 4) !important;
        }
        
        [data-pdf-content] .text-muted-foreground {
          color: rgb(107, 114, 126) !important;
        }

        [data-pdf-content] .text-green-600 {
          color: rgb(22, 163, 74) !important;
        }

        [data-pdf-content] .text-red-600 {
          color: rgb(220, 38, 38) !important;
        }

        /* Background colors */
        [data-pdf-content] .bg-card,
        [data-pdf-content] .bg-background {
          background: rgb(255, 255, 255) !important;
        }

        [data-pdf-content] .bg-muted {
          background: rgb(248, 250, 252) !important;
        }

        [data-pdf-content] .bg-blue-50 {
          background: rgb(239, 246, 255) !important;
        }
        
        [data-pdf-content] .bg-green-50 {
          background: rgb(240, 253, 244) !important;
        }
        
        [data-pdf-content] .bg-red-50 {
          background: rgb(254, 242, 242) !important;
        }

        [data-pdf-content] .bg-gray-50 {
          background: rgb(249, 250, 251) !important;
        }

        /* Border utilities */
        [data-pdf-content] .border {
          border: 1px solid rgb(229, 231, 235) !important;
        }
        
        [data-pdf-content] .border-blue-200 {
          border-color: rgb(191, 219, 254) !important;
        }

        [data-pdf-content] .border-green-200 {
          border-color: rgb(187, 247, 208) !important;
        }

        [data-pdf-content] .border-red-200 {
          border-color: rgb(254, 202, 202) !important;
        }

        [data-pdf-content] .rounded-lg {
          border-radius: 8px !important;
        }

        [data-pdf-content] .rounded-md {
          border-radius: 6px !important;
        }

        /* Width and height utilities */
        [data-pdf-content] .w-full {
          width: 100% !important;
        }

        [data-pdf-content] .h-5 {
          height: 20px !important;
        }

        [data-pdf-content] .w-5 {
          width: 20px !important;
        }

        [data-pdf-content] .h-4 {
          height: 16px !important;
        }

        [data-pdf-content] .w-4 {
          width: 16px !important;
        }

        [data-pdf-content] .h-3 {
          height: 12px !important;
        }

        [data-pdf-content] .w-3 {
          width: 12px !important;
        }

        /* SVG and icons */
        [data-pdf-content] svg {
          width: 20px !important;
          height: 20px !important;
          fill: currentColor !important;
          stroke: currentColor !important;
          flex-shrink: 0 !important;
        }

        /* Buttons and links */
        [data-pdf-content] button,
        [data-pdf-content] [class*="button"] {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          border: 1px solid rgb(229, 231, 235) !important;
          background: rgb(255, 255, 255) !important;
          color: rgb(0, 0, 0) !important;
        }

        /* Chart containers */
        [data-pdf-content] [class*="recharts"] {
          background: rgb(255, 255, 255) !important;
          border: 1px solid rgb(229, 231, 235) !important;
          border-radius: 8px !important;
          min-height: 250px !important;
          width: 100% !important;
        }

        /* Table styles */
        [data-pdf-content] table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        [data-pdf-content] th,
        [data-pdf-content] td {
          padding: 12px !important;
          text-align: left !important;
          border-bottom: 1px solid rgb(229, 231, 235) !important;
        }

        [data-pdf-content] th {
          font-weight: 600 !important;
          background: rgb(249, 250, 251) !important;
        }

        /* Badges and tags */
        [data-pdf-content] [class*="badge"] {
          display: inline-flex !important;
          align-items: center !important;
          border-radius: 4px !important;
          padding: 2px 8px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          background: rgb(243, 244, 246) !important;
          color: rgb(75, 85, 99) !important;
        }

        /* Hide overflow and ensure proper sizing */
        [data-pdf-content] {
          overflow: visible !important;
        }

        [data-pdf-content] * {
          max-width: 100% !important;
          overflow: visible !important;
        }
      `;
      
      document.head.appendChild(safeStyle);
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Create canvas with minimal configuration
      const canvas = await html2canvas(contentElement, {
        scale: 1,
        useCORS: false,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: false,
        removeContainer: false,
        width: contentElement.scrollWidth,
        height: contentElement.scrollHeight,
      });

      // Step 4: Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `reporte-analytics-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el reporte PDF. Por favor, inténtalo de nuevo.");
    } finally {
      // Always restore original stylesheets
      originalStylesheets.forEach(({ element, disabled }) => {
        element.disabled = disabled;
      });
      
      // Remove our safe styles
      const safeStyleElement = document.getElementById('pdf-safe-styles');
      if (safeStyleElement) {
        safeStyleElement.remove();
      }
      
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={generatePDF} disabled={isGenerating}>
      <FileDown className="h-4 w-4 mr-2" />
      {isGenerating ? "Generando..." : "Generar reporte"}
    </Button>
  );
} 