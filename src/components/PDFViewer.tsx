"use client";

interface PDFViewerProps {
  materialId: string;
}

export function PDFViewer({ materialId }: PDFViewerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <iframe
        src={`${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Materiales/${materialId}`}
        className="w-full h-[800px] border rounded-lg shadow-lg"
        title="PDF Viewer"
      />
    </div>
  );
}
