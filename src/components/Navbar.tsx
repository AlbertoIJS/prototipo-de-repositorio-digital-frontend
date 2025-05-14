"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

export function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  function handleSignOut() {
    localStorage.removeItem("userID");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("expiresAt");
    router.push("/login");
  }

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
    <nav className="w-full border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">Repositorio ESCOM</div>
        {email && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex-col items-start">
                <div className="text-sm text-muted-foreground">{email}</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}

interface JWTPayload {
  email: string;
}
