export function MaterialViewer({
  materialType,
  materialUrl,
  materialId,
  userID,
}: PDFViewerProps) {
  const src =
    materialType === "PDF" || materialType === "LINK"
      ? `${process.env.NEXT_PUBLIC_API_URL}/Materiales/Visualizar/${materialId}?userId=${userID}`
      : materialUrl;

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
