"use client";

import { createMaterial, type State } from "@/lib/actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { X, FileIcon, Trash2, Plus, Link, AlertCircle } from "lucide-react";
import { Tags } from "@/components/Tags";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Client-side validation schema (matching server-side)
const AutorSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, "El nombre solo puede contener letras"),
  apellidoP: z.string()
    .min(1, "El apellido paterno es requerido")
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .max(50, "El apellido paterno no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, "El apellido paterno solo puede contener letras"),
  apellidoM: z.string()
    .min(1, "El apellido materno es requerido")
    .min(2, "El apellido materno debe tener al menos 2 caracteres")
    .max(50, "El apellido materno no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, "El apellido materno solo puede contener letras"),
  email: z.string()
    .min(1, "El email es requerido")
    .email("El formato del email no es válido")
    .max(100, "El email no puede exceder 100 caracteres"),
});

const ClientMaterialSchema = z.object({
  nombreMaterial: z.string()
    .min(1, "El nombre del material es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .trim(),
  autores: z.array(AutorSchema)
    .min(1, "Se requiere al menos un autor")
    .max(10, "No se pueden agregar más de 10 autores"),
  tagIds: z.array(z.number().positive("Los IDs de tags deben ser números positivos"))
    .min(1, "Se requiere al menos un tag")
    .max(15, "No se pueden seleccionar más de 15 tags"),
  materialType: z.enum(["file", "url"], {
    required_error: "Debe seleccionar el tipo de material",
    invalid_type_error: "El tipo de material debe ser 'file' o 'url'",
  }),
});

export default function CreateMaterial() {
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
    createMaterial,
    initialState
  );

  const [autores, setAutores] = useState([
    { nombre: "", apellidoP: "", apellidoM: "", email: "" },
  ]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialType, setMaterialType] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [nombreMaterial, setNombreMaterial] = useState("");
  const [clientErrors, setClientErrors] = useState<{[key: string]: string | undefined}>({});
  const [isValidating, setIsValidating] = useState(false);

  // Reset form only when upload is successful (status 201) and redirect
  // Do NOT clear form on validation errors
  useEffect(() => {
    if (state.status === 201) {
      // Reset all form fields only on success
      setAutores([{ nombre: "", apellidoP: "", apellidoM: "", email: "" }]);
      setSelectedTags([]);
      setSelectedFile(null);
      setMaterialType("file");
      setUrl("");
      setNombreMaterial("");
      setClientErrors({});

      // Reset the file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      // Redirect to mis-materiales after a brief delay to show success message
      setTimeout(() => {
        router.push("/mis-materiales");
      }, 1500);
    }
    // Form state is preserved on validation errors (any other status)
  }, [state.status, router]);

  // Sync selectedFile state with actual file input after form submission
  // This handles cases where the browser clears the file input but our state doesn't update
  useEffect(() => {
    if (state.message && state.status !== 201) {
      // Form was submitted but not successful - check if file input was cleared
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput && !fileInput.files?.length && selectedFile) {
        setSelectedFile(null);
      }
    }
  }, [state.message, state.status]);

  // Additional effect to continuously sync selectedFile with file input
  // This ensures UI state matches the actual file input state
  useEffect(() => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      // If we have a selectedFile but the input is empty, clear selectedFile
      if (selectedFile && !fileInput.files?.length) {
        setSelectedFile(null);
      }
      // If we don't have a selectedFile but the input has a file, update selectedFile
      else if (!selectedFile && fileInput.files?.length) {
        const file = fileInput.files[0];
        if (file.type === "application/pdf" || file.type === "application/zip") {
          setSelectedFile(file);
        }
      }
    }
  });

  // Client-side validation function
  const validateForm = () => {
    const formData = {
      nombreMaterial,
      autores,
      tagIds: selectedTags,
      materialType,
    };

    const result = ClientMaterialSchema.safeParse(formData);
    const errors: {[key: string]: string} = {};

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      
      // Handle general field errors
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          errors[field] = messages[0];
        }
      });

      // Handle individual author field errors
      result.error.issues.forEach((issue) => {
        if (issue.path.length >= 2 && issue.path[0] === 'autores') {
          const authorIndex = issue.path[1];
          const field = issue.path[2];
          if (typeof authorIndex === 'number' && typeof field === 'string') {
            errors[`autores.${authorIndex}.${field}`] = issue.message;
          }
        }
      });
    }

    // Validate file/URL based on material type
    if (materialType === "file") {
      if (!selectedFile) {
        errors.archivo = "Se requiere un archivo";
      } else {
        const allowedTypes = ["application/pdf", "application/zip"];
        if (!allowedTypes.includes(selectedFile.type)) {
          errors.archivo = "Solo se permiten archivos PDF y ZIP";
        }
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (selectedFile.size > maxSize) {
          errors.archivo = "El archivo no puede exceder 50MB";
        }
      }
    } else if (materialType === "url") {
      if (!url.trim()) {
        errors.url = "Se requiere una URL";
      } else {
        try {
          const urlObj = new URL(url);
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            errors.url = "La URL debe usar protocolo HTTP o HTTPS";
          }
        } catch {
          errors.url = "La URL no tiene un formato válido";
        }
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced form submission with client-side validation
  const handleSubmit = async (formData: FormData) => {
    setIsValidating(true);
    
    // Perform client-side validation first
    if (!validateForm()) {
      setIsValidating(false);
      return;
    }
    
    // If client-side validation passes, submit the form
    await formAction(formData);
    setIsValidating(false);
    
    // Force synchronization of file state after form submission
    // This handles cases where form submission fails but browser clears file input
    setTimeout(() => {
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        if (!fileInput.files?.length && selectedFile) {
          setSelectedFile(null);
        } else if (fileInput.files?.length && !selectedFile) {
          const file = fileInput.files[0];
          if (file.type === "application/pdf" || file.type === "application/zip") {
            setSelectedFile(file);
          }
        }
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  // Helper function to get error for a field (client or server)
  const getFieldError = (fieldName: string): string | undefined => {
    // Check client errors first, then server errors
    if (clientErrors[fieldName]) {
      return clientErrors[fieldName];
    }
    if (state.errors?.[fieldName as keyof typeof state.errors]) {
      return state.errors[fieldName as keyof typeof state.errors]?.[0];
    }
    return undefined;
  };

  // Helper function to check if a field has an error
  const hasFieldError = (fieldName: string): boolean => {
    return !!(clientErrors[fieldName] || state.errors?.[fieldName as keyof typeof state.errors]);
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
    setAutores([...autores, { nombre: "", apellidoP: "", apellidoM: "", email: "" }]);
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
      } else {
        // If file type is not allowed, clear both state and input
        setSelectedFile(null);
        event.target.value = "";
      }
    } else {
      // If no files selected, clear the state
      setSelectedFile(null);
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
      <form action={handleSubmit} className="grid gap-6 max-w-4xl mx-auto" noValidate>
        <h1 className="text-2xl font-bold mb-4">Nuevo material</h1>

        {/* Success/Error Messages */}
        {state.message && (
          <div
            className={`p-4 rounded-lg border flex items-start gap-2 ${
              state.status === 201
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {state.status !== 201 && <AlertCircle className="size-5 mt-0.5 flex-shrink-0" />}
            <div>{state.message}</div>
          </div>
        )}

        <div data-slot="form-item" className="grid gap-2">
          <Label
            htmlFor="nombreMaterial"
            className={`data-[error=true]:text-destructive data-[error=true]:font-medium ${
              hasFieldError("nombreMaterial") ? "text-destructive font-medium" : ""
            }`}
            data-error={hasFieldError("nombreMaterial") ? "true" : "false"}
          >
            Nombre del material
          </Label>
          <input
            type="text"
            id="nombreMaterial"
            name="nombreMaterial"
            placeholder="Nombre del material"
            value={nombreMaterial}
            onChange={(e) => {
              setNombreMaterial(e.target.value);
              // Clear client error on change
              if (clientErrors.nombreMaterial) {
                setClientErrors(prev => ({ ...prev, nombreMaterial: undefined }));
              }
            }}
            className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
              hasFieldError("nombreMaterial")
                ? "border-red-500 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50"
                : ""
            }`}
            aria-invalid={hasFieldError("nombreMaterial") ? "true" : "false"}
          />
        </div>

        <div data-slot="form-item" className="grid gap-2">
          <Label
            className={`data-[error=true]:text-destructive data-[error=true]:font-medium ${
              hasFieldError("autores") ? "text-destructive font-medium" : ""
            }`}
            data-error={hasFieldError("autores") ? "true" : "false"}
          >
            Autores
          </Label>
          {autores.map((autor, index) => (
            <div key={index} className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 items-start">
              <div className="grid gap-1">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={autor.nombre}
                  onChange={(e) => {
                    handleAutorChange(index, "nombre", e.target.value);
                    // Clear client error on change
                    const errorKey = `autores.${index}.nombre`;
                    if (clientErrors[errorKey]) {
                      setClientErrors(prev => ({ ...prev, [errorKey]: undefined }));
                    }
                  }}
                  className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                    hasFieldError(`autores.${index}.nombre`)
                      ? "border-red-500 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50"
                      : ""
                  }`}
                  aria-invalid={hasFieldError(`autores.${index}.nombre`) ? "true" : "false"}
                />
              </div>
              
              <div className="grid gap-1">
                <input
                  type="text"
                  placeholder="Apellido Paterno"
                  value={autor.apellidoP}
                  onChange={(e) => {
                    handleAutorChange(index, "apellidoP", e.target.value);
                    const errorKey = `autores.${index}.apellidoP`;
                    if (clientErrors[errorKey]) {
                      setClientErrors(prev => ({ ...prev, [errorKey]: undefined }));
                    }
                  }}
                  className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                    hasFieldError(`autores.${index}.apellidoP`)
                      ? "border-red-500 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50"
                      : ""
                  }`}
                  aria-invalid={hasFieldError(`autores.${index}.apellidoP`) ? "true" : "false"}
                />
              </div>
              
              <div className="grid gap-1">
                <input
                  type="text"
                  placeholder="Apellido Materno"
                  value={autor.apellidoM}
                  onChange={(e) => {
                    handleAutorChange(index, "apellidoM", e.target.value);
                    const errorKey = `autores.${index}.apellidoM`;
                    if (clientErrors[errorKey]) {
                      setClientErrors(prev => ({ ...prev, [errorKey]: undefined }));
                    }
                  }}
                  className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                    hasFieldError(`autores.${index}.apellidoM`)
                      ? "border-red-500 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50"
                      : ""
                  }`}
                  aria-invalid={hasFieldError(`autores.${index}.apellidoM`) ? "true" : "false"}
                />
              </div>
              
              <div className="grid gap-1">
                <input
                  type="email"
                  placeholder="Email"
                  value={autor.email}
                  onChange={(e) => {
                    handleAutorChange(index, "email", e.target.value);
                    const errorKey = `autores.${index}.email`;
                    if (clientErrors[errorKey]) {
                      setClientErrors(prev => ({ ...prev, [errorKey]: undefined }));
                    }
                  }}
                  className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                    hasFieldError(`autores.${index}.email`)
                      ? "border-red-500 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50"
                      : ""
                  }`}
                  aria-invalid={hasFieldError(`autores.${index}.email`) ? "true" : "false"}
                />
              </div>
              
              {autores.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAutor(index)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 text-destructive hover:text-destructive/90"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={addAutor}
            variant="secondary"
            disabled={autores.length >= 10}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 mt-2"
          >
            Agregar Autor <Plus />
          </Button>
          {autores.length >= 10 && (
            <p className="text-muted-foreground text-xs">
              Máximo 10 autores permitidos
            </p>
          )}
          <input type="hidden" name="autores" value={JSON.stringify(autores)} />
        </div>

        <div data-slot="form-item" className="grid gap-2">
          <Tags
            selectedTags={selectedTags}
            onTagsChange={(tags) => {
              setSelectedTags(tags);
              // Clear client error on change
              if (clientErrors.tagIds) {
                setClientErrors(prev => ({ ...prev, tagIds: undefined }));
              }
            }}
            error={getFieldError("tagIds")}
          />
          <input
            type="hidden"
            name="tagIds"
            value={JSON.stringify(selectedTags)}
          />
          {selectedTags.length >= 15 && (
            <p className="text-muted-foreground text-xs">
              Máximo 15 tags permitidos
            </p>
          )}
        </div>

        {/* Material Type Selection */}
        <div data-slot="form-item" className="grid gap-2">
          <Label
            className={`data-[error=true]:text-destructive data-[error=true]:font-medium ${
              hasFieldError("materialType") ? "text-destructive font-medium" : ""
            }`}
            data-error={hasFieldError("materialType") ? "true" : "false"}
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
                    // Clear client errors for URL when switching to file
                    if (clientErrors.url) {
                      setClientErrors(prev => ({ ...prev, url: undefined }));
                    }
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
                    // Clear client errors for file when switching to URL
                    if (clientErrors.archivo) {
                      setClientErrors(prev => ({ ...prev, archivo: undefined }));
                    }
                  }
                }}
              />
              <Link className="size-4" />
              <span>Enlace web</span>
            </Label>
          </div>
          <input type="hidden" name="materialType" value={materialType} />
          {getFieldError("materialType") && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="size-3" />
              {getFieldError("materialType")}
            </p>
          )}
        </div>

        {/* Conditional Material Input */}
        {materialType === "file" ? (
          <div data-slot="form-item" className="grid gap-2">
            <Label
              className={`data-[error=true]:text-destructive data-[error=true]:font-medium ${
                hasFieldError("archivo") ? "text-destructive font-medium" : ""
              }`}
              data-error={hasFieldError("archivo") ? "true" : "false"}
            >
              Archivo
            </Label>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] items-center gap-2 ${
                    hasFieldError("archivo")
                      ? "border-destructive ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50"
                      : ""
                  }`}
                  aria-invalid={hasFieldError("archivo") ? "true" : "false"}
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
                  onChange={(e) => {
                    handleFileChange(e);
                    // Clear client error on change
                    if (clientErrors.archivo) {
                      setClientErrors(prev => ({ ...prev, archivo: undefined }));
                    }
                  }}
                />
                <div className="text-sm text-muted-foreground">
                  <p>Formatos permitidos: PDF, ZIP</p>
                  <p>Tamaño máximo: 1 GB</p>
                </div>
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
              {getFieldError("archivo") && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {getFieldError("archivo")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div data-slot="form-item" className="grid gap-2">
            <Label
              htmlFor="url"
              className={`data-[error=true]:text-destructive data-[error=true]:font-medium flex items-center gap-2 ${
                hasFieldError("url") ? "text-destructive font-medium" : ""
              }`}
              data-error={hasFieldError("url") ? "true" : "false"}
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
              onChange={(e) => {
                setUrl(e.target.value);
                // Clear client error on change
                if (clientErrors.url) {
                  setClientErrors(prev => ({ ...prev, url: undefined }));
                }
              }}
              className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                hasFieldError("url")
                  ? "border-destructive ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50"
                  : ""
              }`}
              aria-invalid={hasFieldError("url") ? "true" : "false"}
            />
            {getFieldError("url") && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="size-3" />
                {getFieldError("url")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              La URL debe usar protocolo HTTP o HTTPS
            </p>
          </div>
        )}

        <Button type="submit" size="lg" disabled={isPending || isValidating}>
          {isPending || isValidating ? "Creando..." : "Crear Material"}
        </Button>
      </form>
    </main>
  );
}
