"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  id: string;
  email: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalMaterials: number;
  totalTags: number;
  materialsStatus: {
    available: number;
    unavailable: number;
    pending: number;
  };
  userGrowth: Array<{
    month: string;
    users: number;
  }>;
  materialsByTag: Array<{
    name: string;
    count: number;
  }>;
  popularMaterials: Array<{
    id: number;
    nombre: string;
    favoritos: number;
    autores: string;
    visualizaciones?: number;
  }>;
  materialsByStatus: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  // Add detailed analytics data
  detailedAnalytics: DetailedAnalyticsData;
}

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No auth token found");
    }

    const userID = jwtDecode<JWTPayload>(token as string).id;

    // Fetch data from the single statistics endpoint
    const promises = [
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Estadisticas`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Tags`),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/Materiales?userId=${userID}`
      ),
    ];
    const [response, responseUsers, responseTags, responseMaterials] = await Promise.all(
      promises
    );

    if (!response.ok || !responseUsers.ok || !responseMaterials.ok || !responseTags.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = await response.json();
    const apiResponseUsers = await responseUsers.json();
    const apiResponseMaterials = await responseMaterials.json();
    const apiResponseTags = await responseTags.json();

    const data = apiResponse.data;
    const dataUsers = apiResponseUsers.data;
    const dataMaterials = apiResponseMaterials.data;
    const dataTags = apiResponseTags.data;

    const totalUsers = dataUsers.length || 0;
    const totalMaterials = dataMaterials.length || 0;
    const totalTags = dataTags.length || 0;

    console.log(dataMaterials);

    // Calculate materials status distribution
    const materialsStatus = {
      available: 0,
      unavailable: 0,
      pending: 0,
    };

    const materialsByStatus = {
      total: totalMaterials,
      published: 0,
      draft: 0,
      archived: 0,
    };

    if (data.topMateriales) {
      data.topMateriales.forEach((material: any) => {
        if (material.disponible) {
          materialsStatus.available++;
          materialsByStatus.published++;
        } else {
          materialsStatus.unavailable++;
          materialsByStatus.archived++;
        }
      });

      // Estimate pending materials (materials not in top list)
      const estimatedPendingMaterials = Math.floor(totalMaterials * 0.1);
      materialsStatus.pending = estimatedPendingMaterials;
      materialsByStatus.draft = estimatedPendingMaterials;
    }

    // Generate materials by tag distribution using topMaterias
    const materialsByTag =
      data.topMaterias?.slice(0, 8).map((materia: any) => ({
        name: materia.nombreMateria,
        count: Math.floor(materia.totalConsultas / 100), // Scale down for realistic material counts
      })) || [];

    // Generate user growth data (simulated based on consultation patterns)
    const userGrowth = [
      { month: "Ene", users: Math.floor(totalUsers * 0.15) },
      { month: "Feb", users: Math.floor(totalUsers * 0.25) },
      { month: "Mar", users: Math.floor(totalUsers * 0.4) },
      { month: "Abr", users: Math.floor(totalUsers * 0.55) },
      { month: "May", users: Math.floor(totalUsers * 0.75) },
      { month: "Jun", users: totalUsers },
    ];

    // Generate popular materials from topMateriales
    const popularMaterials =
      data.topMateriales?.slice(0, 5).map((material: any) => ({
        id: material.materialId,
        nombre: material.nombreMaterial,
        favoritos: Math.floor(material.totalConsultas * 0.1), // Estimate favorites as 10% of consultations
        autores: dataMaterials.find(
          (m: any) => m.id === material.materialId
        )?.creadoPor,
        visualizaciones: material.totalConsultas,
      })) || [];

    // Include detailed analytics data from the same endpoint
    const detailedAnalytics: DetailedAnalyticsData = {
      resumen: data.resumen || {
        totalConsultasHistorico: 0,
        totalCarrerasConsultadas: 0,
        totalSemestresConsultados: 0,
        totalMateriasConsultadas: 0,
        totalAutoresConsultados: 0,
        totalMaterialesConsultados: 0,
        carreraMasConsultada: "",
        autorMasConsultado: "",
        materialMasConsultado: "",
      },
      topCarreras: data.topCarreras || [],
      topSemestres: data.topSemestres || [],
      topMaterias: data.topMaterias || [],
      topAutores: data.topAutores || [],
      topMateriales: data.topMateriales || [],
    };

    // Generate recent activity from consultation timestamps
    const result: AnalyticsData = {
      totalUsers,
      totalMaterials,
      totalTags,
      materialsStatus,
      userGrowth,
      materialsByTag,
      popularMaterials,
      materialsByStatus,
      detailedAnalytics,
    };
    return result;
  } catch (error) {
    console.error("Error fetching analytics data:", error);

    // Return comprehensive empty/default data in case of error
    return {
      totalUsers: 0,
      totalMaterials: 0,
      totalTags: 0,
      materialsStatus: {
        available: 0,
        unavailable: 0,
        pending: 0,
      },
      userGrowth: [],
      materialsByTag: [],
      popularMaterials: [],
      materialsByStatus: {
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
      },
      detailedAnalytics: {
        resumen: {
          totalConsultasHistorico: 0,
          totalCarrerasConsultadas: 0,
          totalSemestresConsultados: 0,
          totalMateriasConsultadas: 0,
          totalAutoresConsultados: 0,
          totalMaterialesConsultados: 0,
          carreraMasConsultada: "",
          autorMasConsultado: "",
          materialMasConsultado: "",
        },
        topCarreras: [],
        topSemestres: [],
        topMaterias: [],
        topAutores: [],
        topMateriales: [],
      },
    };
  }
}

export async function fetchUserStats() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No auth token found");
    }

    const userID = jwtDecode<JWTPayload>(token as string).id;

    // Fetch user-specific materials
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Materiales/PorCreador/${userID}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userMaterials = await response.json();
    const materialsData = Array.isArray(userMaterials)
      ? userMaterials
      : userMaterials.data && Array.isArray(userMaterials.data)
        ? userMaterials.data
        : [];

    return {
      totalMaterials: materialsData.length || 0,
      availableMaterials:
        materialsData.filter(
          (m: any) => m.disponible === 1 || m.available === true
        ).length || 0,
      pendingMaterials:
        materialsData.filter(
          (m: any) => m.status === 0 || m.status === "pending"
        ).length || 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalMaterials: 0,
      availableMaterials: 0,
      pendingMaterials: 0,
    };
  }
}

// New interfaces for detailed analytics data
export interface TopAutor {
  autorId: number;
  nombreCompleto: string;
  email: string;
  totalConsultas: number;
  ultimaConsulta: string;
  porcentajeDelTotal: number;
}

export interface TopCarrera {
  tagCarreraId: number;
  nombreCarrera: string;
  totalConsultas: number;
  ultimaConsulta: string;
  porcentajeDelTotal: number;
}

export interface TopSemestre {
  tagSemestreId: number;
  nombreSemestre: string;
  totalConsultas: number;
  ultimaConsulta: string;
  porcentajeDelTotal: number;
}

export interface TopMateria {
  tagMateriaId: number;
  nombreMateria: string;
  totalConsultas: number;
  ultimaConsulta: string;
  porcentajeDelTotal: number;
}

export interface TopMaterial {
  materialId: number;
  nombreMaterial: string;
  tipoArchivo: string;
  disponible: boolean;
  totalConsultas: number;
  ultimaConsulta: string;
  porcentajeDelTotal: number;
}

export interface DetailedAnalyticsData {
  resumen: {
    totalConsultasHistorico: number;
    totalCarrerasConsultadas: number;
    totalSemestresConsultados: number;
    totalMateriasConsultadas: number;
    totalAutoresConsultados: number;
    totalMaterialesConsultados: number;
    carreraMasConsultada: string;
    autorMasConsultado: string;
    materialMasConsultado: string;
  };
  topCarreras: TopCarrera[];
  topSemestres: TopSemestre[];
  topMaterias: TopMateria[];
  topAutores: TopAutor[];
  topMateriales: TopMaterial[];
}


