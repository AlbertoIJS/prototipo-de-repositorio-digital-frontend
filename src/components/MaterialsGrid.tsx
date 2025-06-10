"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
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
  creadorId: number;
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
  userRole,
}: {
  materials: Material[];
  userRole?: string;
  userID?: string;
}) {
  console.log("Materials:", materials);

  // Role-based permissions
  const isStudent = userRole === "1";
  const isProfessor = userRole === "2";
  const isAdmin = userRole === "3";

  // Apply role-based filtering
  const filteredMaterials = materials.filter((material) => {
    // Admin: no filter applied
    if (isAdmin) {
      return true;
    }

    // Student: filter out materials where disponible OR status equals 0
    if (isStudent) {
      return material.disponible !== 0 && material.status !== 0;
    }

    // Professor: apply student filter only if creadorId is not equal to userID
    if (isProfessor) {
      const userIdNumber = userID ? parseInt(userID) : null;
      // If professor is the creator, show all their materials
      if (userIdNumber && material.creadorId === userIdNumber) {
        return true;
      }
      // Otherwise apply the same filter as students
      return material.disponible !== 0 && material.status !== 0;
    }

    // Default: apply student filter
    return material.disponible !== 0 && material.status !== 0;
  });

  if (filteredMaterials.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-gray-500">Aún no hay materiales</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMaterials.map((material) => (
        <Card key={material.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex gap-2 justify-between text-lg font-semibold truncate">
              <span className="truncate">{material.nombre}</span>
              {(isAdmin || isProfessor) && (
                <div className="flex gap-2 items-center">
                  <Badge
                    variant={material.status === 1 ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {material.status === 1 ? "Publicado" : "Pendiente"}
                  </Badge>
                  <Badge
                    variant={
                      material.disponible === 1 ? "default" : "secondary"
                    }
                    className="ml-2"
                  >
                    {material.disponible === 1 ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
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
                {/* Student role (1): Only show "Ir al material" button */}
                {isStudent && (
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
                  </div>
                )}

                {/* Professor role (2): Show "Ir al material" and "Editar material" buttons */}
                {isProfessor && (
                  <>
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
                    </div>
                    {material.status !== 0 && (
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
                  </>
                )}

                {/* Admin role (3): Show all buttons including delete */}
                {isAdmin && (
                  <>
                    <div className="flex justify-between items-center gap-2">
                      <Button asChild type="button" size="sm">
                        <Link
                          href={`/material/${material.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          Ir al material
                        </Link>
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Link href={`/admin/editar-material/${material.id}`}>
                          <Edit className="size-4 mr-2" />
                          Editar material
                        </Link>
                      </Button>
                      {isAdmin && userID && (
                        <DeleteBookmark
                          userID={userID}
                          materialId={material.id}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
