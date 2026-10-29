import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IngresoServicioReporte } from '../models/reporte.models';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  getIngresosPorServicio(desde?: string, hasta?: string): Observable<IngresoServicioReporte[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<IngresoServicioReporte[]>(`${this.apiUrl}/ingresos-por-servicio`, { params });
  }
}
