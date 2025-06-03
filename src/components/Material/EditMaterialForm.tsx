"use client";

import { updateMaterial, updateMaterialAvailability, type State } from "@/lib/actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { X, FileIcon, Trash2, Plus, Link } from "lucide-react";
import { Tags } from "@/components/Tags";
import { useRouter } from "next/navigation";
import { Switch } from "../ui/switch";

interface Material {
  id: number;
  nombre: string;
  url: string;
  favorito: boolean;
  tipoArchivo: string;
  disponible: number;
  status: number;
  creadoPor?: any;
  fechaCreacion: string;
  fechaActualizacion: string;
  autores: Author[];
  tags: Tag[];
}

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
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface EditMaterialFormProps {
  material: Material;
  materialId: string;
  isAdmin?: boolean;
}

export default function EditMaterialForm({
  material,
  materialId,
  isAdmin = false,
}: EditMaterialFormProps) {
  const router = useRouter();
  const initialState: State = {
    message: null,
    errors: {
      nombreMaterial: undefined,
      autores: undefined,
      tagIds: undefined,
      archivo: undefined,
      url: undefined,
      materialType: undefined,
    },
    status: undefined,
  };

  const [state, formAction, isPending] = useActionState<State, FormData>(
    (prevState: State, formData: FormData) =>
      updateMaterial(materialId, prevState, formData),
    initialState
  );

  // Initialize form state with material data
  const [autores, setAutores] = useState(
    material.autores.map((autor) => ({
      nombre: autor.nombre,
      apellidoP: autor.apellidoP,
      apellidoM: autor.apellidoM,
      email: autor.email,
    }))
  );
  const [selectedTags, setSelectedTags] = useState<number[]>(
    material.tags.map((tag) => tag.id)
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialType, setMaterialType] = useState<"file" | "url">(
    material.tipoArchivo === "LINK" ? "url" : "file"
  );
  const [url, setUrl] = useState(material.url || "");
  const [nombreMaterial, setNombreMaterial] = useState(material.nombre);
  const [materialStatus, setMaterialStatus] = useState(material.status);

  // Redirect when update is successful
  useEffect(() => {
    if (state.status === 200) {
      // Redirect to appropriate page based on user type
      setTimeout(() => {
        if (isAdmin) {
          router.push(`/admin/materiales`);
        } else {
          router.push(`/material/${materialId}`);
        }
      }, 1500);
    }
  }, [state.status, router, materialId, isAdmin]);

  const actionStatusChange = async (checked: boolean) => {
    const newStatus = checked ? 1 : 0;
    const result = await updateMaterialAvailability(materialId, newStatus);
    if (result.status === 200) {
      setMaterialStatus(newStatus);
    }
  };

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
    setAutores([
      ...autores,
      { nombre: "", apellidoP: "", apellidoM: "", email: "" },
    ]);
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4">Editar material</h1>
          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={materialStatus === 1}
              onCheckedChange={actionStatusChange}
            />
            <Label htmlFor="status">Disponible</Label>
          </div>
        </div>

        {/* Success/Error Messages */}
        {state.message && (
          <div
            className={`p-4 rounded-lg border ${
              state.status === 200
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {state.message}
          </div>
        )}

        <div data-slot="form-item" className="grid gap-2">
          <Label
            htmlFor="nombreMaterial"
            className="data-[error=true]:text-destructive data-[error=true]:font-medium"
            data-error={state.errors?.nombreMaterial ? "true" : "false"}
          >
            Nombre
          </Label>
          <input
            type="text"
            id="nombreMaterial"
            name="nombreMaterial"
            placeholder="Nombre del material"
            value={nombreMaterial}
            onChange={(e) => setNombreMaterial(e.target.value)}
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
          <Label
            className="data-[error=true]:text-destructive data-[error=true]:font-medium"
            data-error={state.errors?.autores ? "true" : "false"}
          >
            Autores
          </Label>
          {autores.map((autor, index) => (
            <div
              key={index}
              className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 items-center"
            >
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
                placeholder="Apellido Paterno"
                value={autor.apellidoP}
                onChange={(e) =>
                  handleAutorChange(index, "apellidoP", e.target.value)
                }
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={state.errors?.autores?.[index] ? "true" : "false"}
              />
              <input
                type="text"
                placeholder="Apellido Materno"
                value={autor.apellidoM}
                onChange={(e) =>
                  handleAutorChange(index, "apellidoM", e.target.value)
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

        {/* Material Type Selection */}
        <div data-slot="form-item" className="grid gap-2">
          <Label
            className="data-[error=true]:text-destructive data-[error=true]:font-medium"
            data-error={state.errors?.materialType ? "true" : "false"}
          >
            Tipo de material
          </Label>
          <div className="flex gap-4">
            <Label
              htmlFor="materialType-file"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                id="materialType-file"
                checked={materialType === "file"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setMaterialType("file");
                  }
                }}
              />
              <FileIcon className="size-4" />
              <span>Subir archivo</span>
            </Label>
            <Label
              htmlFor="materialType-url"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                id="materialType-url"
                checked={materialType === "url"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setMaterialType("url");
                  }
                }}
              />
              <Link className="size-4" />
              <span>Enlace web</span>
            </Label>
          </div>
          <input type="hidden" name="materialType" value={materialType} />
          {state.errors?.materialType && (
            <p className="text-destructive text-sm -mt-1">
              {state.errors.materialType[0]}
            </p>
          )}
        </div>

        {/* Conditional Material Input */}
        {isAdmin ? (
          // Admin view: Show both file and URL fields regardless of material type
          <>
            <div data-slot="form-item" className="grid gap-2">
              <Label
                className="data-[error=true]:text-destructive data-[error=true]:font-medium"
                data-error={state.errors?.archivo ? "true" : "false"}
              >
                Archivo
              </Label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive items-center gap-2"
                    aria-invalid={state.errors?.archivo ? "true" : "false"}
                  >
                    <FileIcon className="size-4" />
                    {selectedFile
                      ? "Cambiar archivo"
                      : "Seleccionar nuevo archivo"}
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
                    {selectedFile
                      ? "Nuevo archivo seleccionado"
                      : "Mantener archivo actual o seleccionar nuevo"}
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

                {!selectedFile && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Archivo actual: {material.tipoArchivo}. Deja este campo
                      vacío para mantener el archivo actual.
                    </p>
                  </div>
                )}

                {state.errors?.archivo && (
                  <p className="text-destructive text-sm -mt-1">
                    {state.errors.archivo[0]}
                  </p>
                )}
              </div>
            </div>

            <div data-slot="form-item" className="grid gap-2">
              <Label
                htmlFor="url"
                className="data-[error=true]:text-destructive data-[error=true]:font-medium flex items-center gap-2"
                data-error={state.errors?.url ? "true" : "false"}
              >
                <Link className="size-4" />
                URL del material
              </Label>
              <input
                type="url"
                id="url"
                name="url"
                placeholder="https://ejemplo.com/material"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={state.errors?.url ? "true" : "false"}
              />
              {state.errors?.url && (
                <p className="text-destructive text-sm -mt-1">
                  {state.errors.url[0]}
                </p>
              )}
            </div>
          </>
        ) : (
          // Regular user view: Conditional based on material type
          materialType === "file" ? (
            <div data-slot="form-item" className="grid gap-2">
              <Label
                className="data-[error=true]:text-destructive data-[error=true]:font-medium"
                data-error={state.errors?.archivo ? "true" : "false"}
              >
                Archivo
              </Label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive items-center gap-2"
                    aria-invalid={state.errors?.archivo ? "true" : "false"}
                  >
                    <FileIcon className="size-4" />
                    {selectedFile
                      ? "Cambiar archivo"
                      : "Seleccionar nuevo archivo"}
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
                    {selectedFile
                      ? "Nuevo archivo seleccionado"
                      : "Mantener archivo actual o seleccionar nuevo"}
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

                {!selectedFile && materialType === "file" && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Archivo actual: {material.tipoArchivo}. Deja este campo
                      vacío para mantener el archivo actual.
                    </p>
                  </div>
                )}

                {state.errors?.archivo && (
                  <p className="text-destructive text-sm -mt-1">
                    {state.errors.archivo[0]}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div data-slot="form-item" className="grid gap-2">
              <Label
                htmlFor="url"
                className="data-[error=true]:text-destructive data-[error=true]:font-medium flex items-center gap-2"
                data-error={state.errors?.url ? "true" : "false"}
              >
                <Link className="size-4" />
                URL del material
              </Label>
              <input
                type="url"
                id="url"
                name="url"
                placeholder="https://ejemplo.com/material"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={state.errors?.url ? "true" : "false"}
              />
              {state.errors?.url && (
                <p className="text-destructive text-sm -mt-1">
                  {state.errors.url[0]}
                </p>
              )}
            </div>
          )
        )}

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Actualizando..." : "Actualizar Material"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push(isAdmin ? `/admin/materiales` : `/material/${materialId}`)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </main>
  );
}
