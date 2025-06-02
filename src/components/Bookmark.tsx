"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToFavorites, removeFromFavorites } from "@/lib/actions";

export default function BookmarkButton({
  userID,
  materialId,
  isFavorite,
}: {
  userID: string;
  materialId: number;
  isFavorite: boolean;
}) {
  function toggleFavorite() {
    if (isFavorite) {
      removeFromFavorites(userID, materialId);
    } else {
      addToFavorites(userID, materialId);
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleFavorite}>
      <Bookmark className={`size-5 ${isFavorite ? "fill-black" : ""}`} />
    </Button>
  );
}
