"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { fetchTags } from "@/lib/data";
import { Tag } from "@/lib/types";
import { Label } from "@/components/ui/label";

interface TagsProps {
  selectedTags: number[];
  onTagsChange: (tags: number[]) => void;
  error?: string;
}

export function Tags({ selectedTags, onTagsChange, error }: TagsProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags().then((tags) => setTags(tags.data));
  }, []);

  const selectedTagNames = tags
    ?.filter((tag) => selectedTags.includes(tag.id))
    .map((tag) => tag.nombre);

  return (
    <div data-slot="form-item" className="grid gap-2">
      <Label
        data-slot="form-label"
        className="flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive data-[error=true]:font-medium"
        data-error={error ? "true" : "false"}
      >
        Tags
      </Label>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={error ? "true" : "false"}
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive justify-between"
            data-error={error ? "true" : "false"}
          >
            <span className="truncate">
              {selectedTagNames?.length > 0
                ? `${selectedTagNames.length} tags seleccionados`
                : "Seleccionar tags..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          side="bottom"
          align="start"
        >
          <Command className="rounded-lg shadow-md">
            <CommandInput placeholder="Buscar tag..." />
            <CommandEmpty>No se encontraron tags.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {tags?.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.nombre}
                  onSelect={() => {
                    const newSelectedTags = selectedTags.includes(tag.id)
                      ? selectedTags.filter((id) => id !== tag.id)
                      : [...selectedTags, tag.id];
                    onTagsChange(newSelectedTags);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-muted/50"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTags.includes(tag.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {tag.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {selectedTagNames?.map((tagName) => (
          <Badge key={tagName} variant="secondary">
            {tagName}
          </Badge>
        ))}
      </div>

      {error && (
        <p data-slot="form-message" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
