export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
  campos?: Record<string, string>;
}
