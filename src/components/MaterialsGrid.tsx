import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import DeleteBookmark from "./DeleteBookmark";
import { formatDate } from "@/lib/utils";

interface Material {
  id: number;
  nombre: string;
  url: string;
  tipoArchivo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export default async function MaterialsGrid({
  materials,
  userID,
}: {
  materials: Material[];
  userID?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold truncate">
              {material.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Tipo: {material.tipoArchivo}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(material.fechaCreacion)}
              </p>
              <div className="flex justify-between items-center gap-2 mt-6">
                <Button asChild type="button" size="sm">
                  <Link
                    href={`/material/${material.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ir al material
                  </Link>
                </Button>
                {userID && (
                  <DeleteBookmark userID={userID} materialId={material.id} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
