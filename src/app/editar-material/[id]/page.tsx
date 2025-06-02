import { notFound } from "next/navigation";
import { fetchMaterial } from "@/lib/data";
import EditMaterialForm from "@/components/Material/EditMaterialForm";

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await fetchMaterial(id);

  if (!response || !response.data) {
    notFound();
  }

  return <EditMaterialForm material={response.data} materialId={id} />;
}
