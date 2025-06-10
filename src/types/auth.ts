export interface JWTPayload {
  id: string;
  email: string;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  boleta: string;
  rol: string;
  autorId: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
} 