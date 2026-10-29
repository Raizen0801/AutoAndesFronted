export interface ServicioResponse {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
}

export interface ServicioRequest {
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo?: boolean;
}

export interface CambiarEstadoServicioDTO {
  activo: boolean;
}
