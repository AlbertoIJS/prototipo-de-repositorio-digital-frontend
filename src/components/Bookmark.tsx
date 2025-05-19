"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToFavorites } from "@/lib/actions";

export default function BookmarkButton({
  userID,
  materialId,
}: {
  userID: string;
  materialId: number;
}) {
  return (
    <Button variant="ghost" size="icon" onClick={() => addToFavorites(userID, materialId)}>
      <Bookmark className="size-5" />
    </Button>
  );
}
