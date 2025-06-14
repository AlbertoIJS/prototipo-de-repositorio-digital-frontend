"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

interface JWTPayload {
  id: string;
  email: string;
}

export async function signup({
  email,
  name,
  paternalLastName,
  maternalLastName,
  studentId,
}: {
  email: string;
  name: string;
  paternalLastName: string;
  maternalLastName: string;
  studentId?: string;
}) {
  try {
    const requestBody: {
      email: string;
      nombre: string;
      apellidoP: string;
      apellidoM: string;
      boleta?: string;
    } = {
      email,
      nombre: name,
      apellidoP: paternalLastName,
      apellidoM: maternalLastName,
    };

    // Only include boleta if studentId is provided
    if (studentId) {
      requestBody.boleta = studentId;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );
    const data = await res.json();
    if (res.ok) {
      // Revalidate users cache when a new user signs up
      revalidateTag('users');
      return {
        ok: true,
        data,
      };
    }
  } catch (error) {
    console.error("Error in signin:", error);
    return {
      ok: false,
      error,
    };
  }
}

export async function verifyCode({
  code,
  userID,
}: {
  code: string;
  userID: string;
}) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/verifyCode`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: code,
          usuarioId: userID,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      return {
        ok: true,
        data,
      };
    }
  } catch (error) {
    console.error("Error in verifyCode:", error);
    return {
      ok: false,
      error,
    };
  }

  return {
    ok: false,
    error: "Unknown error",
  };
}

export async function signin({ email }: { email: string }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/signin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      return {
        ok: true,
        data,
      };
    } else {
      return {
        ok: false,
        data,
      };
    }
  } catch (error) {
    console.error("Error in signin:", error);
    return {
      ok: false,
      error: "Network error",
    };
  }

  return {
    ok: false,
    error: "Unknown error",
  };
}

export async function fetchTags() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Tags`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchTags:", error);
    return { data: [] };
  }
}

export async function fetchMaterialsByAuthor() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userID = jwtDecode<JWTPayload>(token as string).id;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales/PorCreador/${userID}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchMaterialsByAuthor:", error);
    return [];
  }
}

export async function fetchMaterials(userID: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales?userId=${userID}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchMaterials:", error);
    return [];
  }
}

export async function fetchAllMaterials() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userID = jwtDecode<JWTPayload>(token as string).id;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales?userId=${userID}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchAllMaterials:", error);
    return [];
  }
}

export async function fetchMaterial(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userID = jwtDecode<JWTPayload>(token as string).id;

  if (!token) {
    return {
      ok: false,
      error: "No token found",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales/${id}/Detalles?userId=${userID}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Handle 404 outside try/catch as per Next.js best practices
        console.log("Material not found, redirecting to home");
      }
      throw new Error(`Failed to fetch material: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchMaterial:", error);
    
    // Check if this is a 404 error and redirect accordingly
    if (error instanceof Error && error.message.includes("404")) {
      redirect("/");
    }
    
    return null;
  }
}

export async function fetchFavorites(userID: string | undefined) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Favoritos/${userID}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchFavorites:", error);
    return [];
  }
}

export async function fetchUser(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchUser:", error);
    return null;
  }
}

export async function fetchUsers() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`, {
      cache: 'no-store',
      next: { tags: ['users'] }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    return [];
  }
}

export async function fetchUserHistory(userID: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Historial/${userID}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchUserHistory:", error);
    return {
      ok: false,
      data: [],
      message: "Error fetching history",
      errors: error
    };
  }
}

export async function removeHistory(userID: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Historial/${userID}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in removeHistory:", error);
    return [];
  }
}

export async function removeOneFromHistory(userID: string, materialId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Historial/${userID}/material/${materialId}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in removeOneFromHistory:", error);
    return [];
  }
}

export async function deleteUser(userID: string | number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/${userID}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json();
    
    if (res.ok) {
      // Revalidate users cache when a user is deleted
      revalidateTag('users');
    }
    
    return data;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return {
      ok: false,
      error: "Network error",
    };
  }
}
