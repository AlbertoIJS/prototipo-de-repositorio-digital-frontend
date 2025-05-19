"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type State = {
  errors?: {
    nombreMaterial?: string[];
    autores?: string[];
    tagIds?: string[];
    archivo?: string[];
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
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
});

const MaterialSchema = z.object({
  nombreMaterial: z.string().min(1, "El nombre del material es requerido"),
  autores: z.array(AutorSchema).min(1, "Se requiere al menos un autor"),
  tagIds: z.array(z.number()).min(1, "Se requiere al menos un tag"),
});

export async function createMaterial(
  prevState: State,
  formData: FormData
): Promise<State> {
  // Get the file from FormData
  const archivo = formData.get("archivo") as File;
  if (!archivo) {
    return {
      errors: {
        archivo: ["Se requiere un archivo"],
      },
      message: "Error: Se requiere un archivo",
      status: 400,
    };
  }

  const formValues = {
    nombreMaterial: formData.get("nombreMaterial"),
    autores: JSON.parse((formData.get("autores") as string) || "[]"),
    tagIds: JSON.parse((formData.get("tagIds") as string) || "[]"),
  };

  const validateFields = MaterialSchema.safeParse(formValues);

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: "Error en los campos. No se pudo crear el material.",
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
    apiFormData.append("archivo", archivo);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Materiales/Upload`,
      {
        method: "POST",
        body: apiFormData,
      }
    );

    const resjson = await response.json();
    console.log(resjson);

    if (!response.ok) {
      throw new Error("Error al crear el material");
    }

    return {
      message: "Material creado exitosamente",
      status: response.status,
    };
  } catch (error) {
    return {
      message: "Error al crear el material",
      status: 500,
    };
  }
}

export async function addToFavorites(userId: string, materialId: number) {
  const userID = Number(userId);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Favoritos/Agregar`,
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
      `${process.env.NEXT_PUBLIC_API_URL_USERS}/usuarios/${formValues.userID}`,
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
      `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Favoritos/${userID}/${materialId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Error al remover de favoritos");
    }

    revalidatePath("/favoritos");
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
