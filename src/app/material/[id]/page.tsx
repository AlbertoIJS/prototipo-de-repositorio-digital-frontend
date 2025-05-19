import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialViewer } from "@/components/PDFViewer";
import { fetchMaterial } from "@/lib/data";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { formatDate } from "@/lib/utils";
import BookmarkButton from "@/components/Bookmark";

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const material = (await fetchMaterial(id)) as Material;

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const userID = jwtDecode(token as string).sub;

  if (!userID) {
    return <div>No estás autenticado</div>;
  }

  return (
    <main className="flex-1 py-8 px-4 container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 justify-between">
            {material.nombre}
            <BookmarkButton userID={userID} materialId={material.id} />
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {material.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.nombre}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Autores</h3>
            <div className="space-y-2">
              {material.autores.map((autor) => (
                <div key={autor.id} className="text-sm">
                  {autor.nombre} {autor.apellido} - {autor.email}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Detalles</h3>
            <div className="text-sm space-y-1">
              <p>Tipo de archivo: {material.tipoArchivo}</p>
              <p>Fecha de creación: {formatDate(material.fechaCreacion)}</p>
              <p>
                Última actualización: {formatDate(material.fechaActualizacion)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Vista previa</h3>
            <MaterialViewer
              materialType={material.tipoArchivo}
              materialUrl={material.url}
              materialId={id}
              userID={userID}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

interface Author {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface Tag {
  id: number;
  nombre: string;
}

interface Material {
  id: number;
  nombre: string;
  url: string;
  tipoArchivo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  autores: Author[];
  tags: Tag[];
}
