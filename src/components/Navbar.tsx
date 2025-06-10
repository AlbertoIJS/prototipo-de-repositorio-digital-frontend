"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, User, Menu, LibraryBig } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { getCookie, deleteCookie } from "@/lib/cookies";
import { Input } from "./ui/input";

interface JWTPayload {
  id: string;
  email: string;
  rol: string;
}

function NavbarContent() {
  const [email, setEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"material" | "author">(
    "material"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize search query and type from URL params
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const type =
      (searchParams.get("searchType") as "material" | "author") || "material";
    setSearchQuery(query);
    setSearchType(type);
  }, [searchParams]);

  function handleSearch() {
    const params = new URLSearchParams(searchParams);

    // Update or remove the search query
    if (searchQuery.trim()) {
      params.set("q", searchQuery);
      params.set("searchType", searchType);
    } else {
      params.delete("q");
      params.delete("searchType");
    }

    // Navigate to home if not already there, otherwise update current page
    if (pathname !== "/") {
      router.push(`/?${params.toString()}`);
    } else {
      router.push(`?${params.toString()}`);
    }

    // Close mobile search on submit
    setShowMobileSearch(false);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

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
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol,
          });
          setEmail(decoded.email);
          setUserRole(decoded.rol);
        } else {
          console.log("No token found, user not authenticated");
          setEmail(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error decoding token in navbar:", error);
        setEmail(null);
        setUserRole(null);

        // If token is invalid, clean up
        deleteCookie("auth_token");
        deleteCookie("expiresAt");
        localStorage.removeItem("userID"); // Only userID is in localStorage
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadUserData();

    // Listen for auth changes (login/logout in other components)
    const handleAuthChange = () => {
      console.log("Auth change detected in navbar, reloading user data");
      setIsLoading(true); // Set loading to true when auth changes
      loadUserData();
    };

    // Listen for custom storage events and native storage events
    window.addEventListener("localStorageUpdate", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    // Also listen for a custom login event
    window.addEventListener("userLoggedIn", handleAuthChange);

    return () => {
      window.removeEventListener("localStorageUpdate", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("userLoggedIn", handleAuthChange);
    };
  }, []);

  // Also check for auth state changes when pathname changes (e.g., after redirect from login)
  useEffect(() => {
    const checkAuthOnPageChange = () => {
      console.log("Page change detected, checking auth state");
      const token = getCookie("auth_token");
      
      // If we have a token but no email set, reload user data
      if (token && !email && !isLoading) {
        console.log("Token found but no email set, reloading user data");
        setIsLoading(true);
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          setEmail(decoded.email);
          setUserRole(decoded.rol);
        } catch (error) {
          console.error("Error decoding token on page change:", error);
          setEmail(null);
          setUserRole(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuthOnPageChange();
  }, [pathname, email, isLoading]);

  // Early loading state - only show this briefly during initial mount
  if (isLoading && !email && !userRole) {
    return (
      <nav className="w-full border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LibraryBig className="w-6 h-6" />
            <Link href="/" className="text-xl font-bold">
              Repositorio ESCOM
            </Link>
          </div>
          <div className="h-9 w-9 animate-pulse bg-gray-200 rounded-full" />
        </div>
      </nav>
    );
  }

  const getPlaceholderText = () => {
    return searchType === "material"
      ? "Buscar materiales..."
      : "Buscar autores...";
  };

  const shouldShowSearch = pathname === "/" || searchQuery;

  // Role-based permissions
  const isProfessor = userRole === "2";
  const isAdmin = userRole === "3";

  // Mobile User Menu Component
  const MobileUserMenu = () => (
    <div className="flex flex-col space-y-2 p-4 border-t">
      <div className="text-sm text-gray-600 pb-2">{email}</div>
      
      {/* Favoritos - Available for all roles (students, professors, admins) */}
      <Link
        href="/favoritos"
        className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Mis favoritos
      </Link>
      
      {/* Mis materiales - Only for professors and admins */}
      {(isProfessor || isAdmin) && (
        <Link
          href="/mis-materiales"
          className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Mis materiales
        </Link>
      )}
      
      {/* Panel de administración - Only for admins */}
      {isAdmin && (
        <Link
          href="/admin"
          className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Panel de administración
        </Link>
      )}
      
      <button
        onClick={handleSignOut}
        className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
      >
        Cerrar sesión
      </button>
    </div>
  );

  // Search Component
  const SearchComponent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex items-center gap-2 ${isMobile ? "w-full" : ""}`}>
      <div
        className={`flex items-center rounded-md border ${isMobile ? "flex-1" : ""}`}
      >
        <Select
          value={searchType}
          onValueChange={(value: "material" | "author") => setSearchType(value)}
        >
          <SelectTrigger
            className={`${isMobile ? "w-28" : "w-32"} border-0 border-r rounded-l-md rounded-r-none focus:ring-0`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="material">Materiales</SelectItem>
            <SelectItem value="author">Autores</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder={getPlaceholderText()}
          className={`${isMobile ? "flex-1" : "w-64 md:w-80"} border-0 rounded-l-none rounded-r-md focus-visible:ring-0`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <Button variant="outline" size="icon" onClick={handleSearch}>
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <nav className="w-full border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Main navigation bar */}
        <div className="flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <LibraryBig className="w-6 h-6" />
            <Link href="/" className="text-xl font-bold">
              Repositorio ESCOM
            </Link>
          </div>

          {/* Desktop Search - Hidden on mobile */}
          {shouldShowSearch && (
            <div className="hidden md:flex">
              <SearchComponent />
            </div>
          )}

          {/* Desktop User Menu - Hidden on mobile */}
          <div className="hidden md:flex">
            {isLoading ? (
              <div className="h-9 w-9 animate-pulse bg-gray-200 rounded-full" />
            ) : email ? (
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
                  
                  {/* Favoritos - Available for all roles (students, professors, admins) */}
                  <DropdownMenuItem asChild className="flex-col items-start">
                    <Link href="/favoritos">Mis favoritos</Link>
                  </DropdownMenuItem>
                  
                  {/* Mis materiales - Only for professors and admins */}
                  {(isProfessor || isAdmin) && (
                    <DropdownMenuItem asChild className="flex-col items-start">
                      <Link href="/mis-materiales">Mis materiales</Link>
                    </DropdownMenuItem>
                  )}
                  
                  {/* Panel de administración - Only for admins */}
                  {isAdmin && (
                    <DropdownMenuItem asChild className="flex-col items-start">
                      <Link href="/admin">Panel de administración</Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600"
                  >
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            {/* Search Button for Mobile */}
            {shouldShowSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="h-9 w-9"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* User Menu/Auth Buttons for Mobile */}
            {isLoading ? (
              <div className="h-9 w-9 animate-pulse bg-gray-200 rounded-full" />
            ) : email ? (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex items-center justify-between mb-4">
                    <SheetTitle className="text-lg font-semibold">
                      Menú
                    </SheetTitle>
                  </div>
                  <MobileUserMenu />
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
        </div>

        {/* Mobile Search Bar - Shows when search button is clicked */}
        {shouldShowSearch && showMobileSearch && (
          <div className="md:hidden mt-3 pt-3 border-t">
            <SearchComponent isMobile />
          </div>
        )}
      </div>
    </nav>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <nav className="w-full border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Repositorio ESCOM
            </Link>
            <div className="h-9 w-9" />
          </div>
        </nav>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
