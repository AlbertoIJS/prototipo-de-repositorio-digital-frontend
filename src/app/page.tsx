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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, ChevronDown, ChevronUp, Menu, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JWTPayload {
  id: string;
  email: string;
}

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
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const selectedTagsParam = searchParams.get("tags") || "";
  
  // Memoize selectedTagIds to prevent unnecessary re-renders
  const selectedTagIds = useMemo(() => {
    if (!selectedTagsParam) return [];
    return selectedTagsParam.split(",").map(Number).filter(Boolean);
  }, [selectedTagsParam]);

  // Initialize user authentication
  useEffect(() => {
    const accessToken = getCookie("auth_token");
    
    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const decodedUserID = jwtDecode<JWTPayload>(accessToken).id;

      if (!decodedUserID) {
        router.push("/login");
        return;
      }

      setUserID(decodedUserID);
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/login");
    }
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
  const createSearchParams = (query: string, tagIds: number[], userID: string) => {
    const params = new URLSearchParams({
      userId: userID,
    });

    // Add text search parameters (for material and author names)
    if (query.trim()) {
      params.append('materialNombre', query);
      params.append('autorNombre', query);
    }

    // Add tag filter parameter (comma-separated tag IDs)
    if (tagIds.length > 0) {
      params.append('tags', tagIds.join(','));
    }

    return params;
  };

  // Handle tag selection
  const handleTagToggle = (tagId: number) => {
    const params = new URLSearchParams(searchParams);
    const currentTags = selectedTagIds;
    
    let newSelectedTags;
    if (currentTags.includes(tagId)) {
      newSelectedTags = currentTags.filter(id => id !== tagId);
    } else {
      newSelectedTags = [...currentTags, tagId];
    }

    if (newSelectedTags.length > 0) {
      params.set("tags", newSelectedTags.join(","));
    } else {
      params.delete("tags");
    }

    router.push(`?${params.toString()}`);
    
    // Close mobile sidebar after selection
    setIsMobileSidebarOpen(false);
  };

  // Handle tag removal
  const handleTagRemove = (tagId: number) => {
    const params = new URLSearchParams(searchParams);
    const newSelectedTags = selectedTagIds.filter(id => id !== tagId);
    
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

  // TagFilter Sidebar Component
  const TagFilterSidebar = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 ${className}`}>
      {/* Tag Filter Card */}
      {allTags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Filtrar por categorías</span>
              <div className="flex items-center gap-2">
                {selectedTagIds.length > 0 && (
                  <Badge variant="secondary">
                    {selectedTagIds.length} seleccionadas
                  </Badge>
                )}
                {allTags.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="h-auto p-1 text-xs flex items-center gap-1"
                  >
                    {showAllTags ? (
                      <>
                        Mostrar menos <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Ver todas ({allTags.length}) <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(showAllTags ? allTags : allTags.slice(0, 6)).map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="text-sm font-normal cursor-pointer flex-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tag.nombre}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear filters button */}
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
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
        selectedTagIds: selectedTagIds.join(",") 
      });
      
      setLoading(true);
      try {
        let response;
        
        if (searchQuery.trim() || selectedTagIds.length > 0) {
          // Use search endpoint when there's a search query or tag filters
          const searchUrlParams = createSearchParams(searchQuery, selectedTagIds, userID);
          console.log("Search URL:", `${process.env.NEXT_PUBLIC_API_URL}/Materiales/Search?${searchUrlParams}`);
          
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/Materiales/Search?${searchUrlParams}`
          );
        } else {
          // Use regular materials endpoint when no search query or filters
          console.log("Regular fetch URL:", `${process.env.NEXT_PUBLIC_API_URL}/Materiales?userId=${userID}`);
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
        
        // Filter materials for role 1 (professors) - only show available and published materials
        // TODO: Add proper role checking here
        const filteredByRole = materialsData.filter(
          (material: Material) => material.disponible === 1 && material.status === 1
        );

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
  }, [userID, searchQuery, selectedTagIds]); // Keep dependencies but selectedTagIds is now memoized

  if (loading) {
    return (
      <main className="flex-1 py-8 px-4 container mx-auto">
        <div className="flex justify-center items-center">
          <p className="text-gray-500">Cargando materiales...</p>
        </div>
      </main>
    );
  }

  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));
  const hasFilters = searchQuery || selectedTagIds.length > 0;

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Header with Hamburger Menu */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {hasFilters ? "Resultados de búsqueda" : "Más recientes"}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
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
                    <span className="text-xs">Búsqueda:</span> {searchQuery}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete("q");
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
                Se encontraron {materials.length} resultado{materials.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-lg z-50 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TagFilterSidebar />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-8">
            <h1 className="text-2xl font-bold mb-6">
              {hasFilters ? "Resultados de búsqueda" : "Más recientes"}
            </h1>
            
            {/* Active Filters Display - Desktop */}
            {hasFilters && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {searchQuery && (
                    <Badge variant="outline" className="gap-1">
                      <span className="text-xs">Búsqueda:</span> {searchQuery}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.delete("q");
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
                  Se encontraron {materials.length} resultado{materials.length !== 1 ? 's' : ''}
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
          <MaterialsGrid materials={materials} userID={userID || undefined} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="flex-1 py-8 px-4 container mx-auto">
        <div className="flex justify-center items-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
