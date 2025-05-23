"use server";

import { cookies } from "next/headers";
import { Tag } from "./types";
import { jwtDecode } from "jwt-decode";

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
  studentId: string;
}) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_USERS}/usuarios/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nombre: name,
          apellidoP: paternalLastName,
          apellidoM: maternalLastName,
          boleta: studentId,
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
      `${process.env.NEXT_PUBLIC_API_URL_USERS}/usuarios/verifyCode`,
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
      `${process.env.NEXT_PUBLIC_API_URL_USERS}/usuarios/signin`,
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Tags`
    );
    const data = (await res.json()) as Tag[];
    return data;
  } catch (error) {
    console.error("Error in fetchTags:", error);
    return [];
  }
}

export async function fetchMaterials(userID: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Materiales?userId=${userID}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchMaterials:", error);
    return [];
  }
}

export async function fetchMaterial(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const userID = jwtDecode(token as string).sub;

  if (!token) {
    return {
      ok: false,
      error: "No token found",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Materiales/${id}/Detalles?userId=${userID}&id=${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch material");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchMaterial:", error);
    return null;
  }
}

export async function fetchFavorites(userID: string | undefined) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_MATERIALS}/Favoritos/${userID}`
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
      `${process.env.NEXT_PUBLIC_API_URL_USERS}/usuarios/${id}`
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_USERS}/usuarios`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    return [];
  }
}

export async function deleteUser(userID: string | number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_USERS}/usuarios/${userID}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return {
      ok: false,
      error: "Network error",
    };
  }
}
