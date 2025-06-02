import MaterialsGrid from "@/components/MaterialsGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchMaterialsByAuthor } from "@/lib/data";

export default async function MaterialesPage() {
  const materials = await fetchMaterialsByAuthor();

  console.log(materials.data);

  return (
    <main className="flex-1 py-8 px-4 container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">Mis materiales</h1>
        <Button asChild>
          <Link href="/crear-material">Nuevo material</Link>
        </Button>
      </div>
      <MaterialsGrid materials={materials.data} isEditable={true} />
    </main>
  );
}
