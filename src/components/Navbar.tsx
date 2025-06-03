"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User } from "lucide-react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { getCookie, deleteCookie } from "@/lib/cookies";
import { Input } from "./ui/input";

interface JWTPayload {
  sub: string;
  email: string;
}

export function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  function handleSignOut() {
    console.log("=== SIGNING OUT ===");

    // Clean up cookies (new approach)
    deleteCookie("auth_token");
    deleteCookie("expiresAt");

    // Clean up localStorage (only userID is stored there now)
    localStorage.removeItem("userID");

    // Trigger storage event for other components
    window.dispatchEvent(new Event("localStorageUpdate"));

    console.log("All tokens cleared, redirecting to login");
    router.push("/login");
  }

  useEffect(() => {
    const loadUserData = () => {
      try {
        console.log("=== NAVBAR LOADING USER DATA ===");

        // Get token from cookies (new approach)
        const token = getCookie("auth_token");
        console.log("Token from cookies:", token ? "EXISTS" : "NOT_FOUND");

        if (token) {
          console.log("Decoding token for navbar...");
          const decoded = jwtDecode<JWTPayload>(token);
          console.log("Decoded user data:", {
            sub: decoded.sub,
            email: decoded.email,
          });
          setEmail(decoded.email);
        } else {
          console.log("No token found, user not authenticated");
          setEmail(null);
        }
      } catch (error) {
        console.error("Error decoding token in navbar:", error);
        setEmail(null);

        // If token is invalid, clean up
        deleteCookie("auth_token");
        deleteCookie("expiresAt");
        localStorage.removeItem("userID"); // Only userID is in localStorage
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Listen for auth changes (login/logout in other components)
    const handleAuthChange = () => {
      console.log("Auth change detected in navbar, reloading user data");
      loadUserData();
    };

    window.addEventListener("localStorageUpdate", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("localStorageUpdate", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Don't render user menu while loading
  if (isLoading) {
    return (
      <nav className="w-full border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Repositorio ESCOM
          </Link>
          <div className="h-9 w-9" /> {/* Placeholder for loading */}
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Repositorio ESCOM
        </Link>
        {pathname === "/" && (
          <div className="flex items-center gap-2">
            <Input type="text" placeholder="Buscar" className="w-96" />
            <Button variant="outline" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        )}
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
              <DropdownMenuItem disabled className="flex-col items-start">
                {email}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex-col items-start">
                <Link href="/favoritos">Mis favoritos</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex-col items-start">
                <Link href="/mis-materiales">Mis materiales</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex-col items-start">
                <Link href="/admin/usuarios">Usuarios</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex-col items-start">
                <Link href="/admin">Panel de administración</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
