"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { removeHistory } from "@/lib/data";
import { HistoryMaterial } from "@/lib/types";
import HistoryItem from "./HistoryItem";
import { toast } from "sonner";

interface HistoryGridProps {
  initialHistory: HistoryMaterial[];
  userID: string;
}

export default function HistoryGrid({ initialHistory, userID }: HistoryGridProps) {
  const [history, setHistory] = useState<HistoryMaterial[]>(initialHistory);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleRemoveOne = (materialId: number) => {
    setHistory(prev => prev.filter(item => item.id !== materialId));
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
    try {
      await removeHistory(userID);
      setHistory([]);
      toast.success("Historial eliminado completamente");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Error al eliminar el historial");
    } finally {
      setIsClearingAll(false);
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay materiales en tu historial
          </h3>
          <p className="text-gray-500">
            Los materiales que visites aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with clear all button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Historial de materiales ({history.length})
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Materiales que has visitado recientemente
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isClearingAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar historial
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Limpiar todo el historial?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todos los materiales de tu historial. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAll}
                className="bg-red-500 hover:bg-red-600"
                disabled={isClearingAll}
              >
                {isClearingAll ? "Eliminando..." : "Limpiar historial"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* History items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((material) => (
          <HistoryItem
            key={material.id}
            material={material}
            userID={userID}
            onRemove={handleRemoveOne}
          />
        ))}
      </div>
    </div>
  );
}
