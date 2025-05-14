import { Tag } from "./types";

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

    const data = await res.text();
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
