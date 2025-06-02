import { fetchMaterials } from "@/lib/data";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";
import MaterialsGrid from "@/components/MaterialsGrid";

export default async function Home() {
  const cookieStore = await cookies();
  const encodedAccessToken = cookieStore.get("auth_token")?.value;

  if (!encodedAccessToken) {
    redirect("/login");
  }

  const accessToken = decodeURIComponent(encodedAccessToken);
  const userID = jwtDecode(accessToken).sub;

  if (!userID) {
    redirect("/login");
  }

  /*
  Profesores: Pueden ver todos los materiales con status 0/1 y disponible 0/1 solo si son los creadores
  Administradores: pueden ver todos los materiales siempre independientemente del status o disponible
  */
  const materials = await fetchMaterials(userID);
  const filteredMaterials = materials.data.filter(
    (material) => material.disponible === 1 && material.status === 1
  );

  console.log(filteredMaterials);
  return (
    <main className="flex-1 py-8 px-4 container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Más recientes</h1>
      <MaterialsGrid materials={materials.data} />
    </main>
  );
}
