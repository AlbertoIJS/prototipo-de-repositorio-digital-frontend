import { fetchMaterials } from "@/lib/data";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";
import MaterialsGrid from "@/components/MaterialsGrid";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const userID = jwtDecode(accessToken as string).sub;

  if (!userID) {
    redirect("/login");
  }

  const materials = await fetchMaterials(userID);

  return (
    <main className="flex-1 py-8 px-4 container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Más recientes</h1>
      <MaterialsGrid materials={materials} />
    </main>
  );
}
