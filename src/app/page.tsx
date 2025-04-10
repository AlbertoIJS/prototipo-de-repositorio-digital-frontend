"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  email: string;
  // Add other fields from your JWT as needed
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // This code only runs in the browser
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode<JWTPayload>(token);
        setEmail(decoded.email);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  return (
    <main className="h-svh p-4 grid place-items-center">
      {email ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
          <p>{email}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </main>
  );
}
