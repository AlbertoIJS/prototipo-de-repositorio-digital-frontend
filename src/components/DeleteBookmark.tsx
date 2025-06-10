"use client";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeMaterial } from "@/lib/actions";

export default function DeleteBookmark({ materialId }: { materialId: number }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => removeMaterial(materialId)}
    >
      <Trash className="size-5 text-red-500" />
    </Button>
  );
}
