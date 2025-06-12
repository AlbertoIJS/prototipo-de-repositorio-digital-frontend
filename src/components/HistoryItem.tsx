"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, ExternalLink, Calendar } from "lucide-react";
import { removeOneFromHistory } from "@/lib/data";
import { HistoryMaterial } from "@/lib/types";
import Link from "next/link";
import { toast } from "sonner";

interface HistoryItemProps {
  material: HistoryMaterial;
  userID: string;
  onRemove: (materialId: number) => void;
}

export default function HistoryItem({ material, userID, onRemove }: HistoryItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeOneFromHistory(userID, material.id.toString());
      onRemove(material.id);
      toast.success("Material eliminado del historial");
    } catch (error) {
      console.error("Error removing material from history:", error);
      toast.error("Error al eliminar el material del historial");
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start gap-4">
          <span className="text-lg font-semibold truncate flex-1 max-w-[25ch] md:max-w-[20ch]">{material.nombre}</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar del historial?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará &quot;{material.nombre}&quot; de tu historial. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemove}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isRemoving}
                >
                  {isRemoving ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="flex flex-col space-y-3 w-full h-full">
          {/* File type and visit date */}
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className="text-xs">
              {material.tipoArchivo}
            </Badge>
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(material.fechaConsulta)}</span>
            </div>
          </div>

          {/* Authors */}
          {material.autores && material.autores.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Autores: </span>
              {material.autores.map((autor, index) => (
                <span key={autor.id}>
                  {autor.nombre} {autor.apellidoP} {autor.apellidoM}
                  {index < material.autores.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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

          {/* Action button */}
          <div className="pt-2 mt-auto">
            <Button asChild size="sm" className="w-full">
              <Link
                href={`/material/${material.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ver material
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
