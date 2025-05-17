"use server";

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

export async function createMaterial(prevState: State, formData: FormData): Promise<State> {
  // Get the file from FormData
  const archivo = formData.get("archivo") as File;
  if (!archivo) {
    return {
      errors: {
        archivo: ["Se requiere un archivo"],
      },
      message: "Error: Se requiere un archivo",
      status: 400
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
      status: 400
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
      status: response.status
    };
  } catch (error) {
    return {
      message: "Error al crear el material",
      status: 500
    };
  }
}
