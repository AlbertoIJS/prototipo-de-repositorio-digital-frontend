"use client";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeFromFavorites } from "@/lib/actions";

export default function DeleteBookmark({
  userID,
  materialId,
}: {
  userID: string;
  materialId: number;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => removeFromFavorites(userID, materialId)}
    >
      <Trash className="size-5 text-red-500" />
    </Button>
  );
}
