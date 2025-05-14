"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PDFViewer } from "@/components/PDFViewer";
import { Navbar } from "@/components/Navbar";

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

export function MaterialDetails({ id }: { id: string }) {
  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Materiales/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch material");
        }
        const data = await response.json();
        setMaterial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Cargando material...
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="text-red-500 text-center min-h-[400px]">
        {error || "Material no encontrado"}
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col">
      <Navbar email={email} onSignOut={() => {}} />
      <main className="flex-1 py-8 px-4 container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{material.nombre}</CardTitle>
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
                <p>
                  Fecha de creación:{" "}
                  {new Date(material.fechaCreacion).toLocaleDateString(
                    "es-MX",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
                <p>
                  Última actualización:{" "}
                  {new Date(material.fechaActualizacion).toLocaleDateString(
                    "es-MX",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {material.tipoArchivo === "PDF" && material.url && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Vista previa</h3>
                <PDFViewer base64Data={material.url} />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
