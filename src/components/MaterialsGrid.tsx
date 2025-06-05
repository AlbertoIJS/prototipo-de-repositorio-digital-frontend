"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { formatDate } from "@/lib/utils";
import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import DeleteBookmark from "./DeleteBookmark";

interface Author {
  id: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
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
  status: number;
  disponible?: number;
  tipoArchivo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  autores?: Author[];
  tags?: Tag[];
  favorito?: boolean;
}

export default function MaterialsGrid({
  materials,
  userID,
  isEditable = false,
  isAdmin = false,
}: {
  materials: Material[];
  userID?: string;
  isEditable?: boolean;
  isAdmin?: boolean;
}) {
  if (materials.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-gray-500">Aún no hay materiales</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex gap-2 justify-between text-lg font-semibold truncate">
              <span className="truncate">{material.nombre}</span>
              {isEditable && material.status === 0 && (
                <Badge className="ml-2">Pendiente</Badge>
              )}
              {isAdmin && (
                <Badge variant={material.status === 1 ? "default" : "secondary"} className="ml-2">
                  {material.status === 1 ? "Publicado" : "Pendiente"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Tipo: {material.tipoArchivo}
              </p>
              
              {/* Show authors if available */}
              {material.autores && material.autores.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Autores: </span>
                  {material.autores.map((autor, index) => (
                    <span key={autor.id}>
                      {autor.nombre} {autor.apellidoP} {autor.apellidoM}
                      {index < material.autores!.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              )}

              {/* Show tags if available */}
              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {material.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.nombre}
                    </Badge>
                  ))}
                  {material.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{material.tags.length - 3} más
                    </Badge>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-500">
                {formatDate(material.fechaCreacion)}
              </p>
              
              <div className="flex flex-col gap-2 mt-6">
                {!isEditable && (
                  <div className="flex justify-between items-center gap-2">
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
                      <DeleteBookmark
                        userID={userID}
                        materialId={material.id}
                      />
                    )}
                  </div>
                )}
                {isEditable && !isAdmin && material.status !== 0 && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/editar-material/${material.id}`}>
                      <Edit className="size-4 mr-2" />
                      Editar material
                    </Link>
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/admin/editar-material/${material.id}`}>
                      <Edit className="size-4 mr-2" />
                      Editar material
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
