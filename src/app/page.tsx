"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import MaterialsGrid from "@/components/MaterialsGrid";
import { getCookie } from "@/lib/cookies";
import { useSearchParams } from "next/navigation";
import { fetchTags } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { JWTPayload } from "@/types/auth";

interface Author {
  id: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  email: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface Tag {
  id: number;
  nombre: string;
}

interface Material {
  id: number;
  nombre: string;
  creadorId: number;
  url: string;
  status: number;
  disponible?: number;
  tipoArchivo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  autores: Author[];
  tags: Tag[];
  favorito: boolean;
}

function HomeContent() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTagFilter, setMobileTagFilter] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const searchType = searchParams.get("searchType") || "material";
  const selectedTagsParam = searchParams.get("tags") || "";

  // Memoize selectedTagIds to prevent unnecessary re-renders
  const selectedTagIds = useMemo(() => {
    if (!selectedTagsParam) return [];
    return selectedTagsParam.split(",").map(Number).filter(Boolean);
  }, [selectedTagsParam]);

  // Initialize user authentication and mobile detection
  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 1024 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const accessToken = getCookie("auth_token");

    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode<JWTPayload>(accessToken);

      if (!decodedToken.id) {
        router.push("/login");
        return;
      }

      setUserID(decodedToken.id);
      setUserRole(decodedToken.rol);
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/login");
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [router]);

  // Fetch all available tags (only once)
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await fetchTags();
        setAllTags(tagsData.data || []);
      } catch (error) {
        console.error("Error loading tags:", error);
        setAllTags([]);
      }
    };

    loadTags();
  }, []); // Only run once

  // Function to create search parameters based on query and selected tags
  const createSearchParams = (
    query: string,
    searchType: string,
    tagIds: number[],
    userID: string
  ) => {
    const params = new URLSearchParams({
      userId: userID,
    });

    // Add text search parameters based on search type
    if (query.trim()) {
      if (searchType === "material") {
        params.append("materialNombre", query);
      } else if (searchType === "author") {
        params.append("autorNombre", query);
      }
    }

    // Add tag filter parameter (comma-separated tag IDs)
    if (tagIds.length > 0) {
      params.append("tags", tagIds.join(","));
    }

    return params;
  };

  // Handle tag selection
  const handleTagToggle = (tagId: number) => {
    const params = new URLSearchParams(searchParams);
    const currentTags = selectedTagIds;

    let newSelectedTags;
    if (currentTags.includes(tagId)) {
      newSelectedTags = currentTags.filter((id) => id !== tagId);
    } else {
      newSelectedTags = [...currentTags, tagId];
    }

    if (newSelectedTags.length > 0) {
      params.set("tags", newSelectedTags.join(","));
    } else {
      params.delete("tags");
    }

    router.push(`?${params.toString()}`);
  };

  // Handle tag removal
  const handleTagRemove = (tagId: number) => {
    const params = new URLSearchParams(searchParams);
    const newSelectedTags = selectedTagIds.filter((id) => id !== tagId);

    if (newSelectedTags.length > 0) {
      params.set("tags", newSelectedTags.join(","));
    } else {
      params.delete("tags");
    }

    router.push(`?${params.toString()}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    router.push("/");
  };

  // Tag Filter Component with new UI
  const TagFilterComponent = () => (
    <div className="space-y-4">
      {/* Tag Filter Card */}
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Filtrar por categorías</span>
            {selectedTagIds.length > 0 && (
              <Badge variant="secondary">
                {selectedTagIds.length} seleccionadas
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Selected Tags Display */}
          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags
                .filter((tag) => selectedTagIds.includes(tag.id))
                .map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="gap-1 text-xs"
                  >
                    {tag.nombre}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleTagRemove(tag.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
            </div>
          )}

          {/* Tag Selector - Desktop Only */}
          {!isMobile && (
            <div className="relative">
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-left focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setTagPopoverOpen(!tagPopoverOpen)}
                  >
                    <span className="text-muted-foreground">
                      Buscar categorías...
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 max-w-[270px]"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <Command>
                    <CommandInput placeholder="Buscar categorías..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                      <CommandGroup>
                        {allTags.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.nombre}
                            onSelect={() => {
                              handleTagToggle(tag.id);
                              setTagPopoverOpen(false);
                            }}
                            className="flex items-center justify-between"
                          >
                            <span>{tag.nombre}</span>
                            {selectedTagIds.includes(tag.id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // TagFilter Sidebar Component
  const TagFilterSidebar = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 ${className}`}>
      <TagFilterComponent />

      {/* Clear filters button */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  // Fetch materials based on search query and selected tags
  useEffect(() => {
    if (!userID) return;

    const fetchMaterials = async () => {
      console.log("Fetching materials with:", {
        userID,
        searchQuery,
        searchType,
        selectedTagIds: selectedTagIds.join(","),
      });

      setLoading(true);
      try {
        let response;

        if (searchQuery.trim() || selectedTagIds.length > 0) {
          // Use search endpoint when there's a search query or tag filters
          const searchUrlParams = createSearchParams(
            searchQuery,
            searchType,
            selectedTagIds,
            userID
          );
          console.log(
            "Search URL:",
            `${process.env.NEXT_PUBLIC_API_URL}/Materiales/Search?${searchUrlParams}`
          );

          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/Materiales/Search?${searchUrlParams}`
          );
        } else {
          // Use regular materials endpoint when no search query or filters
          console.log(
            "Regular fetch URL:",
            `${process.env.NEXT_PUBLIC_API_URL}/Materiales?userId=${userID}`
          );
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/Materiales?userId=${userID}`
          );
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch materials: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);
        const materialsData = data.data || [];

        // Filter materials for role 1 (students) - only show available and published materials
        // For other roles, show all materials they have access to
        let filteredByRole;
        if (userRole === "1") {
          filteredByRole = materialsData.filter(
            (material: Material) =>
              material.disponible === 1 && material.status === 1
          );
        } else {
          // Professors and admins can see all materials
          filteredByRole = materialsData;
        }

        console.log("Filtered materials:", filteredByRole.length);
        setMaterials(filteredByRole);
      } catch (error) {
        console.error("Error loading materials:", error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [userID, userRole, searchQuery, searchType, selectedTagIds]);

  if (loading) {
    return (
      <main className="flex-1 py-8 px-4 container mx-auto">
        <div className="flex justify-center items-center">
          <p className="text-gray-500">Cargando materiales...</p>
        </div>
      </main>
    );
  }

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));
  const hasFilters = searchQuery || selectedTagIds.length > 0;

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="relative bg-gradient-to-r from-blue-500 to-blue-800 rounded-lg overflow-hidden mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 px-6 py-12 lg:px-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Hero Content */}
            <div className="flex-1 text-white text-center lg:text-left">
              <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                Bienvenido al Repositorio ESCOM
              </h1>
              <p className="text-lg lg:text-xl mb-6 text-blue-100">
                Descubre una amplia colección de materiales educativos, recursos
                de aprendizaje y contenido académico creado por tus profesores
                para potenciar tu educación.
              </p>
            </div>
            <div className="flex-shrink-0 rounded-lg bg-white">
              <div className="w-64 h-48 lg:w-80 lg:h-60 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <img
                    src="/escom.png"
                    alt=""
                    className="w-full h-full object-contain"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tags Modal */}
      {isMobile && tagPopoverOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Seleccionar categorías</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTagPopoverOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={mobileTagFilter}
                onChange={(e) => setMobileTagFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              {allTags
                .filter((tag) =>
                  tag.nombre
                    .toLowerCase()
                    .includes(mobileTagFilter.toLowerCase())
                )
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left rounded-md border transition-colors",
                      selectedTagIds.includes(tag.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent border-input"
                    )}
                    onClick={() => {
                      handleTagToggle(tag.id);
                      setTagPopoverOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tag.nombre}</span>
                      {selectedTagIds.includes(tag.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 py-8">
        {/* Mobile Header with Hamburger Menu */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {hasFilters ? "Resultados de búsqueda" : "Más reciente"}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTagPopoverOpen(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {selectedTagIds.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTagIds.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters Display - Mobile */}
          {hasFilters && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {searchQuery && (
                  <Badge variant="outline" className="gap-1">
                    <span className="text-xs">
                      {searchType === "material" ? "Material:" : "Autor:"}
                    </span>
                    {searchQuery}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete("q");
                        params.delete("searchType");
                        router.push(`?${params.toString()}`);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {selectedTags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="gap-1">
                    {tag.nombre}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleTagRemove(tag.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Se encontraron {materials.length} resultado
                {materials.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-8">
            <h1 className="text-2xl font-bold mb-6">
              {hasFilters ? "Resultados de búsqueda" : "Categorías"}
            </h1>

            {/* Active Filters Display - Desktop */}
            {hasFilters && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {searchQuery && (
                    <Badge variant="outline" className="gap-1">
                      <span className="text-xs">
                        {searchType === "material" ? "Material:" : "Autor:"}
                      </span>
                      {searchQuery}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.delete("q");
                          params.delete("searchType");
                          router.push(`?${params.toString()}`);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedTags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="gap-1">
                      {tag.nombre}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => handleTagRemove(tag.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Se encontraron {materials.length} resultado
                  {materials.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <TagFilterSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            {!hasFilters && (
              <h1 className="text-2xl font-bold">Más recientes</h1>
            )}
          </div>

          {/* Materials Grid */}
          <MaterialsGrid materials={materials} userRole="1" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 py-8 px-4 container mx-auto">
          <div className="flex justify-center items-center">
            <p className="text-gray-500">Cargando...</p>
          </div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
