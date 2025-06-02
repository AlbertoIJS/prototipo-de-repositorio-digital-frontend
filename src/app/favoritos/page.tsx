import { fetchFavorites } from "@/lib/data";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import MaterialsGrid from "@/components/MaterialsGrid";

export default async function FavoritosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userID = jwtDecode(token as string).sub;

  if (!userID) {
    return <div>No estás autenticado</div>;
  }

  const favorites = await fetchFavorites(userID);

  return (
    <main className="flex-1 py-8 px-4 container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis favoritos</h1>
      {favorites.length === 0 ? (
        <p className="text-muted-foreground mt-4">Aún no tienes favoritos</p>
      ) : (
        <MaterialsGrid userID={userID} materials={favorites.data} />
      )}
    </main>
  );
}
