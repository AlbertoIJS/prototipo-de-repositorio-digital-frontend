"use client";

import { createMaterial, type State } from "@/lib/actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { X, FileIcon, Trash2, Plus } from "lucide-react";
import { Tags } from "@/components/Tags";

export default function CreateMaterial() {
  const initialState: State = {
    message: null,
    errors: {
      nombreMaterial: undefined,
      autores: undefined,
      tagIds: undefined,
      archivo: undefined,
    },
    status: undefined,
  };

  const [state, formAction] = useActionState<State, FormData>(
    createMaterial,
    initialState
  );

  const [autores, setAutores] = useState([
    { nombre: "", apellido: "", email: "" },
  ]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset form when upload is successful
  useEffect(() => {
    if (state.status && state.status >= 200 && state.status < 300) {
      // Reset all form fields
      setAutores([{ nombre: "", apellido: "", email: "" }]);
      setSelectedTags([]);
      setSelectedFile(null);

      // Reset the file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      // Reset the nombre input
      const nombreInput = document.getElementById(
        "nombreMaterial"
      ) as HTMLInputElement;
      if (nombreInput) {
        nombreInput.value = "";
      }
    }
  }, [state.status]);

  const handleAutorChange = (
    index: number,
    field: keyof (typeof autores)[0],
    value: string
  ) => {
    const newAutores = [...autores];
    newAutores[index] = { ...newAutores[index], [field]: value };
    setAutores(newAutores);
  };

  const addAutor = () => {
    setAutores([...autores, { nombre: "", apellido: "", email: "" }]);
  };

  const removeAutor = (index: number) => {
    if (autores.length > 1) {
      setAutores(autores.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.type === "application/zip") {
        setSelectedFile(file);

        // Update the file input's files
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        event.target.files = dataTransfer.files;
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <main className="p-6 container mx-auto">
      <form action={formAction} className="grid gap-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Nuevo material</h1>

        <div data-slot="form-item" className="grid gap-2">
          <label
            data-slot="form-label"
            htmlFor="nombreMaterial"
            className="flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive data-[error=true]:font-medium"
            data-error={state.errors?.nombreMaterial ? "true" : "false"}
          >
            Nombre
          </label>
          <input
            type="text"
            id="nombreMaterial"
            name="nombreMaterial"
            placeholder="Nombre del material"
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            aria-invalid={state.errors?.nombreMaterial ? "true" : "false"}
          />
          {state.errors?.nombreMaterial && (
            <p
              data-slot="form-message"
              className="text-destructive text-sm -mt-1"
            >
              {state.errors.nombreMaterial[0]}
            </p>
          )}
        </div>

        <div data-slot="form-item" className="grid gap-2">
          <label
            className="flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive data-[error=true]:font-medium"
            data-error={state.errors?.autores ? "true" : "false"}
          >
            Autores
          </label>
          {autores.map((autor, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <input
                type="text"
                placeholder="Nombre"
                value={autor.nombre}
                onChange={(e) =>
                  handleAutorChange(index, "nombre", e.target.value)
                }
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={state.errors?.autores?.[index] ? "true" : "false"}
              />
              <input
                type="text"
                placeholder="Apellido"
                value={autor.apellido}
                onChange={(e) =>
                  handleAutorChange(index, "apellido", e.target.value)
                }
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={state.errors?.autores?.[index] ? "true" : "false"}
              />
              <input
                type="email"
                placeholder="Email"
                value={autor.email}
                onChange={(e) =>
                  handleAutorChange(index, "email", e.target.value)
                }
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={state.errors?.autores?.[index] ? "true" : "false"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAutor(index)}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 ${
                  autores.length === 1 ? "hidden" : ""
                }`}
              >
                <X className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={addAutor}
            variant="secondary"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 mt-2"
          >
            Agregar Autor <Plus />
          </Button>
          <input type="hidden" name="autores" value={JSON.stringify(autores)} />
        </div>

        <Tags
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          error={state.errors?.tagIds?.[0]}
        />
        <input
          type="hidden"
          name="tagIds"
          value={JSON.stringify(selectedTags)}
        />

        <div data-slot="form-item" className="grid gap-2">
          <label
            className="flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive data-[error=true]:font-medium"
            data-error={state.errors?.archivo ? "true" : "false"}
          >
            Material
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive items-center gap-2"
                aria-invalid={state.errors?.archivo ? "true" : "false"}
              >
                <FileIcon className="size-4" />
                Seleccionar archivo
              </Button>
              <input
                type="file"
                id="file-upload"
                name="archivo"
                className="hidden"
                accept=".pdf,.zip"
                onChange={handleFileChange}
              />
              <span className="text-sm text-muted-foreground">
                Formatos permitidos: PDF, ZIP
              </span>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg max-w-4xl">
                <div className="flex items-center gap-2">
                  <FileIcon className="size-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
            {state.errors?.archivo && (
              <p className="text-destructive text-sm -mt-1">
                {state.errors.archivo[0]}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" size="lg">
          Crear Material
        </Button>
      </form>
    </main>
  );
}
