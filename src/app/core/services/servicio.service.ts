import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CambiarEstadoServicioDTO, ServicioRequest, ServicioResponse } from '../models/servicio.models';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/servicios`;

  getServicios(): Observable<ServicioResponse[]> {
    return this.http.get<ServicioResponse[]>(this.apiUrl);
  }

  getServicio(id: number): Observable<ServicioResponse> {
    return this.http.get<ServicioResponse>(`${this.apiUrl}/${id}`);
  }

  crearServicio(datos: ServicioRequest): Observable<ServicioResponse> {
    return this.http.post<ServicioResponse>(this.apiUrl, datos);
  }

  actualizarServicio(id: number, datos: ServicioRequest): Observable<ServicioResponse> {
    return this.http.put<ServicioResponse>(`${this.apiUrl}/${id}`, datos);
  }

  eliminarServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number, activo: boolean): Observable<ServicioResponse> {
    const payload: CambiarEstadoServicioDTO = { activo };
    return this.http.patch<ServicioResponse>(`${this.apiUrl}/${id}/estado`, payload);
  }
}
