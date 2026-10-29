import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnularOrdenRequest,
  FiltrosOrdenes,
  OrdenServicioRequest,
  OrdenServicioResponse
} from '../models/orden.models';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ordenes`;

  getOrdenes(filtros?: FiltrosOrdenes): Observable<OrdenServicioResponse[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.placa?.trim()) params = params.set('placa', filtros.placa.trim());
      if (filtros.estado?.trim()) params = params.set('estado', filtros.estado.trim());
      if (filtros.desde?.trim()) params = params.set('desde', filtros.desde.trim());
      if (filtros.hasta?.trim()) params = params.set('hasta', filtros.hasta.trim());
    }
    return this.http.get<OrdenServicioResponse[]>(this.apiUrl, { params });
  }

  getOrden(id: number): Observable<OrdenServicioResponse> {
    return this.http.get<OrdenServicioResponse>(`${this.apiUrl}/${id}`);
  }

  registrarOrden(datos: OrdenServicioRequest): Observable<OrdenServicioResponse> {
    return this.http.post<OrdenServicioResponse>(this.apiUrl, datos);
  }

  anularOrden(id: number, request: AnularOrdenRequest): Observable<OrdenServicioResponse> {
    return this.http.patch<OrdenServicioResponse>(`${this.apiUrl}/${id}/anular`, request);
  }
}
