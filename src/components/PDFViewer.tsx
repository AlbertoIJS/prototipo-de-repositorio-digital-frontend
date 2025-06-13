"use client";

import * as React from "react";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export function MaterialViewer({
  materialType,
  materialUrl,
  materialId,
  userID,
}: PDFViewerProps) {
  const src =
    materialType === "PDF"
      ? `${process.env.NEXT_PUBLIC_API_URL}/Materiales/Visualizar/${materialId}?userId=${userID}`
      : materialUrl;

  if (materialType === "PDF") {
    return (
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div
          className="w-full h-[750px] border rounded-lg shadow-lg"
        >
          <Viewer fileUrl={src} defaultScale={SpecialZoomLevel.PageFit} />
        </div>
      </Worker>
    );
  }

  return (
    <iframe
      src={src}
      className="w-full h-[800px] border rounded-lg shadow-lg"
    />
  );
}

interface PDFViewerProps {
  materialId: string;
  userID: string;
  materialType: string;
  materialUrl: string;
}
