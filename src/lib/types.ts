export type Tag = {
  id: number;
  nombre: string;
};

export interface Author {
  id: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  email: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface HistoryMaterial {
  id: number;
  nombre: string;
  url: string;
  tipoArchivo: string;
  fechaConsulta: string;
  autores: Author[];
  tags: Tag[];
}

export interface HistoryResponse {
  ok: boolean;
  data: HistoryMaterial[];
  message: string | null;
  errors: string | null;
}
