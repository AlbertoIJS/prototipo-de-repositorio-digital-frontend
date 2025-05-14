"use client";

interface PDFViewerProps {
  base64Data: string;
}

export function PDFViewer({ base64Data }: PDFViewerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <iframe
        src={`data:application/pdf;base64,${base64Data}`}
        className="w-full h-[800px] border rounded-lg shadow-lg"
        title="PDF Viewer"
      />
    </div>
  );
} 