"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  id: string;
  email: string;
}

export type State = {
  errors?: {
    nombreMaterial?: string[];
    autores?: string[];
    tagIds?: string[];
    archivo?: string[];
    url?: string[];
    materialType?: string[];
    'autores.0.nombre'?: string[];
    'autores.0.apellidoP'?: string[];
    'autores.0.apellidoM'?: string[];
    'autores.0.email'?: string[];
    'autores.1.nombre'?: string[];
    'autores.1.apellidoP'?: string[];
    'autores.1.apellidoM'?: string[];
    'autores.1.email'?: string[];
    // Add more author fields as needed
    [key: string]: string[] | undefined;
  };
  message: string | null;
  status?: number;
};

export type UserState = {
  errors?: {
    userID?: string[];
    nombre?: string[];
    apellidoP?: string[];
    apellidoM?: string[];
    email?: string[];
    boleta?: string[];
    rol?: string[];
  };
  message: string | null;
  status?: number;
};

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

const MaterialSchema = z.object({
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

export async function createMaterial(
  prevState: State,
  formData: FormData
): Promise<State> {
  // Get user ID from JWT token
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return {
      message: "Error: No se encontró token de autenticación",
      status: 401,
    };
  }

  const userID = jwtDecode<JWTPayload>(token).id;

  const materialType = formData.get("materialType") as string;
  const archivo = formData.get("archivo") as File;
  const url = formData.get("url") as string;

  // Parse and validate authors array
  let autoresData;
  try {
    const autoresString = formData.get("autores") as string;
    autoresData = JSON.parse(autoresString || "[]");
  } catch {
    return {
      errors: {
        autores: ["Los datos de autores no son válidos"],
      },
      message: "Error: Los datos de autores no son válidos",
      status: 400,
    };
  }

  // Parse and validate tag IDs array
  let tagIdsData;
  try {
    const tagIdsString = formData.get("tagIds") as string;
    tagIdsData = JSON.parse(tagIdsString || "[]");
  } catch {
    return {
      errors: {
        tagIds: ["Los datos de tags no son válidos"],
      },
      message: "Error: Los datos de tags no son válidos",
      status: 400,
    };
  }

  const formValues = {
    nombreMaterial: formData.get("nombreMaterial") as string,
    autores: autoresData,
    tagIds: tagIdsData,
    materialType: materialType,
  };

  // Validate basic form fields first
  const validateFields = MaterialSchema.safeParse(formValues);

  if (!validateFields.success) {
    const fieldErrors = validateFields.error.flatten().fieldErrors;
    
    return {
      errors: fieldErrors,
      message: "Error en los campos del formulario. Por favor, corrige los errores.",
      status: 400,
    };
  }

  // Validate that either file or URL is provided based on materialType
  if (materialType === "file") {
    if (!archivo || archivo.size === 0) {
      return {
        errors: {
          archivo: ["Se requiere un archivo"],
        },
        message: "Error: Se requiere un archivo",
        status: 400,
      };
    }
    
    // Validate file type and size
    const allowedTypes = ["application/pdf", "application/zip"];
    if (!allowedTypes.includes(archivo.type)) {
      return {
        errors: {
          archivo: ["Solo se permiten archivos PDF y ZIP"],
        },
        message: "Error: Formato de archivo no válido",
        status: 400,
      };
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (archivo.size > maxSize) {
      return {
        errors: {
          archivo: ["El archivo no puede exceder 50MB"],
        },
        message: "Error: El archivo es demasiado grande",
        status: 400,
      };
    }
    
  } else if (materialType === "url") {
    if (!url || url.trim() === "") {
      return {
        errors: {
          url: ["Se requiere una URL"],
        },
        message: "Error: Se requiere una URL",
        status: 400,
      };
    }
    
    // Enhanced URL validation
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          errors: {
            url: ["La URL debe usar protocolo HTTP o HTTPS"],
          },
          message: "Error: Protocolo de URL no válido",
          status: 400,
        };
      }
    } catch {
      return {
        errors: {
          url: ["La URL no tiene un formato válido"],
        },
        message: "Error: La URL no es válida",
        status: 400,
      };
    }
  } else {
    return {
      errors: {
        materialType: ["Debe seleccionar el tipo de material"],
      },
      message: "Error: Debe seleccionar el tipo de material",
      status: 400,
    };
  }

  try {
    // Create a new FormData instance for the API call
    const apiFormData = new FormData();

    // Add the datosJson field with the stringified data
    const datosJson = JSON.stringify({
      nombreMaterial: validateFields.data.nombreMaterial,
      autores: validateFields.data.autores,
      tagIds: validateFields.data.tagIds,
    });

    apiFormData.append("datosJson", datosJson);
    
    // Add either file or URL based on materialType
    if (materialType === "file") {
      apiFormData.append("archivo", archivo);
      apiFormData.append("Url", ""); // Empty URL when using file
    } else {
      apiFormData.append("Url", url);
      // Create an empty file when using URL
      apiFormData.append("archivo", new File([], "", { type: "application/octet-stream" }));
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales/Upload?userId=${userID}`,
      {
        method: "POST",
        body: apiFormData,
      }
    );

    const resjson = await response.json();

    if (!response.ok) {
      // Handle API-specific errors
      if (response.status === 400) {
        return {
          message: resjson.message || "Error de validación en el servidor",
          status: response.status,
        };
      }
      throw new Error("Error al crear el material");
    }

    return {
      message: "Material creado exitosamente",
      status: response.status,
    };
  } catch (error) {
    console.error("Error creating material:", error);
    return {
      message: "Error interno del servidor. Por favor, inténtalo de nuevo.",
      status: 500,
    };
  }
}

export async function updateMaterial(
  materialId: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  // Get user ID from JWT token
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return {
      message: "Error: No se encontró token de autenticación",
      status: 401,
    };
  }

  const userID = jwtDecode<JWTPayload>(token).id;

  const materialType = formData.get("materialType") as string;
  const archivo = formData.get("archivo") as File;
  const url = formData.get("url") as string;

  // For updates, both file and URL are optional - admins can modify either or both
  if (materialType === "file" && archivo && archivo.size > 0) {
    // Validate file if a new one is provided
    if (archivo.type !== "application/pdf" && archivo.type !== "application/zip") {
      return {
        errors: {
          archivo: ["Solo se permiten archivos PDF y ZIP"],
        },
        message: "Error: Formato de archivo no válido",
        status: 400,
      };
    }
  }

  // URL validation only if provided and not empty
  if (url && url.trim() !== "") {
    try {
      new URL(url);
    } catch {
      return {
        errors: {
          url: ["La URL no es válida"],
        },
        message: "Error: La URL no es válida",
        status: 400,
      };
    }
  }

  if (!materialType) {
    return {
      errors: {
        materialType: ["Debe seleccionar el tipo de material"],
      },
      message: "Error: Debe seleccionar el tipo de material",
      status: 400,
    };
  }

  const formValues = {
    nombreMaterial: formData.get("nombreMaterial"),
    autores: JSON.parse((formData.get("autores") as string) || "[]"),
    tagIds: JSON.parse((formData.get("tagIds") as string) || "[]"),
    materialType: materialType,
  };

  const validateFields = MaterialSchema.safeParse(formValues);

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: "Error en los campos. No se pudo actualizar el material.",
      status: 400,
    };
  }

  try {
    // Create a new FormData instance for the API call
    const apiFormData = new FormData();

    // Add the datosJson field with the stringified data
    const datosJson = JSON.stringify({
      nombreMaterial: formValues.nombreMaterial,
      autores: formValues.autores,
      tagIds: formValues.tagIds,
    });

    apiFormData.append("datosJson", datosJson);
    
    // Handle file upload - always send nuevoArchivo field
    if (archivo && archivo.size > 0) {
      apiFormData.append("nuevoArchivo", archivo);
    } else {
      // Create an empty file to maintain the existing file
      apiFormData.append("nuevoArchivo", new File([], "", { type: "application/octet-stream" }));
    }
    
    // Handle URL - always send nuevaUrl field
    apiFormData.append("nuevaUrl", url || "");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales/${materialId}?id=${userID}`,
      {
        method: "PUT",
        body: apiFormData,
      }
    );

    const resjson = await response.json();
    console.log(resjson);

    if (!response.ok) {
      throw new Error("Error al actualizar el material");
    }

    revalidatePath(`/material/${materialId}`);
    revalidatePath("/mis-materiales");
    revalidatePath("/admin/materiales");

    return {
      message: "Material actualizado exitosamente",
      status: response.status,
    };
  } catch (error) {
    return {
      message: "Error al actualizar el material",
      status: 500,
    };
  }
}

export async function addToFavorites(userId: string, materialId: number) {
  const userID = Number(userId);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Favoritos/Agregar`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ userId: userID, materialId }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar a favoritos");
    }

    revalidatePath(`/material/${materialId}`);
    return {
      message: "Material agregado a favoritos",
      status: response.status,
    };
  } catch (error) {
    return {
      message: "Error al agregar a favoritos",
      status: 500,
    };
  }
}

const UpdateUserSchema = z.object({
  userID: z.number(),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  apellidoP: z
    .string()
    .min(3, "El apellido paterno debe tener al menos 3 caracteres"),
  apellidoM: z
    .string()
    .min(3, "El apellido materno debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  boleta: z.string().min(10, "La boleta debe tener al menos 10 caracteres"),
  rol: z.string().min(1, "El rol es requerido"),
});

export async function updateUser(
  prevState: UserState,
  formData: FormData
): Promise<UserState> {
  const formValues = Object.fromEntries(formData.entries());

  const validateFields = UpdateUserSchema.safeParse({
    userID: Number(formValues.userID),
    nombre: formValues.nombre,
    apellidoP: formValues.apellidoP,
    apellidoM: formValues.apellidoM,
    email: formValues.email,
    boleta: formValues.boleta,
    rol: formValues.rol,
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: "Error en los campos",
      status: 400,
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/${formValues.userID}`,
      {
        method: "PUT",
        body: JSON.stringify({
          nombre: formValues.nombre,
          apellidoP: formValues.apellidoP,
          apellidoM: formValues.apellidoM,
          email: formValues.email,
          boleta: formValues.boleta,
          rol: formValues.rol,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      return {
        message: "Error al actualizar el usuario",
        status: response.status,
      };
    }

    revalidatePath("/admin/usuarios");
    return {
      message: "Usuario actualizado exitosamente",
      status: 200,
    };
  } catch (error) {
    return {
      message: "Error al actualizar el usuario",
      status: 500,
    };
  }
}

export async function removeFromFavorites(userId: string, materialId: number) {
  const userID = Number(userId);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Favoritos/${userID}/${materialId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Error al remover de favoritos");
    }

    revalidatePath(`/material/${materialId}`);
    revalidatePath(`/favoritos`);
    return {
      message: "Material removido de favoritos",
      status: response.status,
    };
  } catch (error) {
    return {
      message: "Error al remover de favoritos",
      status: 500,
    };
  }
}

export async function updateMaterialAvailability(materialId: string, disponible: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales/disponibilidad?materialId=${materialId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disponible }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar la disponibilidad del material");
    }

    revalidatePath(`/material/${materialId}`);
    revalidatePath("/mis-materiales");
    revalidatePath("/admin/materiales");
    
    return {
      message: disponible === 1 ? "Material marcado como disponible" : "Material marcado como no disponible",
      status: response.status,
    };
  } catch (error) {
    return {
      message: "Error al actualizar la disponibilidad del material",
      status: 500,
    };
  }
}

export async function updateMaterialStatus(materialId: string, status: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Admin/status?materialId=${materialId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar el estado del material");
    }

    revalidatePath(`/material/${materialId}`);
    revalidatePath("/mis-materiales");
    revalidatePath("/admin/materiales");
    
    return {
      message: status === 1 ? "Material activado" : "Material desactivado",
      status: response.status,
    };
  } catch (error) {
    return {
      message: "Error al actualizar el estado del material",
      status: 500,
    };
  }
}