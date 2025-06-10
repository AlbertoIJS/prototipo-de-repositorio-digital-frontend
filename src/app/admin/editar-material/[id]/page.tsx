import { notFound } from "next/navigation";
import { fetchMaterial } from "@/lib/data";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { JWTPayload } from "@/types/auth";
import EditMaterialForm from "@/components/Material/EditMaterialForm";

export default async function AdminEditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const decodedToken = jwtDecode<JWTPayload>(token as string);
  const userRole = decodedToken.rol;

  const { id } = await params;
  const response = await fetchMaterial(id);

  if (!response || !response.data) {
    notFound();
  }

  return (
    <EditMaterialForm
      material={response.data}
      materialId={id}
      isAdmin={userRole === "3"}
    />
  );
}
