import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VehiculoRequest, VehiculoResponse } from '../models/vehiculo.models';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vehiculos`;

  getVehiculos(clienteId?: number): Observable<VehiculoResponse[]> {
    let params = new HttpParams();
    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    return this.http.get<VehiculoResponse[]>(this.apiUrl, { params });
  }

  getVehiculo(id: number): Observable<VehiculoResponse> {
    return this.http.get<VehiculoResponse>(`${this.apiUrl}/${id}`);
  }

  crearVehiculo(datos: VehiculoRequest): Observable<VehiculoResponse> {
    return this.http.post<VehiculoResponse>(this.apiUrl, datos);
  }

  actualizarVehiculo(id: number, datos: VehiculoRequest): Observable<VehiculoResponse> {
    return this.http.put<VehiculoResponse>(`${this.apiUrl}/${id}`, datos);
  }

  eliminarVehiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
