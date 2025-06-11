import { fetchUserHistory } from "@/lib/data";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { JWTPayload } from "@/types/auth";
import { HistoryResponse } from "@/lib/types";
import HistoryGrid from "@/components/HistoryGrid";

export default async function History() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return (
      <main className="flex-1 py-8 px-4 container mx-auto">
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-bold mb-4">Historial</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver tu historial.</p>
        </div>
      </main>
    );
  }

  const decodedToken = jwtDecode<JWTPayload>(token);
  const userID = decodedToken.id;

  const historyResponse: HistoryResponse = await fetchUserHistory(userID);

  return (
    <main className="flex-1 py-8 px-4 container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Historial</h1>
        <p className="text-gray-600">
          Revisa los materiales educativos que has visitado
        </p>
      </div>
      
      {historyResponse.ok ? (
        <HistoryGrid 
          initialHistory={historyResponse.data} 
          userID={userID} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar el historial
            </h3>
            <p className="text-gray-500">
              {historyResponse.message || "Ha ocurrido un error inesperado"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}