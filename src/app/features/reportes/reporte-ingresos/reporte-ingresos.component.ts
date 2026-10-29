import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../core/services/reporte.service';
import { IngresoServicioReporte } from '../../../core/models/reporte.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-reporte-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Reporte: Ingresos por Servicio</h2>
          <p class="text-muted small mb-0">
            Consulta agregada con proyección JPQL (excluye órdenes ANULADAS)
          </p>
        </div>
      </div>

      <!-- Alerta error -->
      <div *ngIf="mensajeError()" class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
        <div class="flex-grow-1">{{ mensajeError() }}</div>
        <button type="button" class="btn-close" (click)="mensajeError.set(null)" aria-label="Close"></button>
      </div>

      <!-- Filtro Rango de Fechas -->
      <div class="card shadow-sm border-0 mb-3">
        <div class="card-body p-3">
          <form (ngSubmit)="consultar()" class="row g-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label small text-muted mb-1">Fecha Desde:</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="desde" name="desde" />
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted mb-1">Fecha Hasta:</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="hasta" name="hasta" />
            </div>
            <div class="col-md-4 d-flex gap-2">
              <button type="submit" class="btn btn-primary btn-sm px-3">
                <i class="bi bi-search me-1"></i>Generar Reporte
              </button>
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="limpiar()">
                <i class="bi bi-x-circle me-1"></i>Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Spinner -->
      <div *ngIf="cargando()" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted small mt-2">Calculando estadísticas y totales...</p>
      </div>

      <!-- Tabla Reporte -->
      <div *ngIf="!cargando()" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 120px;">Código</th>
                <th>Servicio</th>
                <th class="text-center" style="width: 160px;">Cantidad Total</th>
                <th class="text-end" style="width: 180px;">Importe Total (S/)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="reporte.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">
                  <i class="bi bi-bar-chart fs-2 d-block mb-2"></i>
                  No se registraron ingresos por servicios para el rango de fechas seleccionado.
                </td>
              </tr>

              <tr *ngFor="let item of reporte">
                <td>
                  <span class="badge bg-secondary font-monospace">{{ item.codigo }}</span>
                </td>
                <td class="fw-semibold text-dark">{{ item.servicio }}</td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border">{{ item.cantidadTotal }}</span>
                </td>
                <td class="text-end fw-bold text-success">
                  S/ {{ item.importeTotal | number: '1.2-2' }}
                </td>
              </tr>
            </tbody>
            <tfoot *ngIf="reporte.length > 0">
              <tr class="table-light fs-6">
                <td colspan="2" class="text-end fw-bold">TOTAL GENERAL:</td>
                <td class="text-center fw-bold">{{ sumaCantidadTotal }} serv.</td>
                <td class="text-end fw-bold text-primary fs-5">S/ {{ sumaImporteTotal | number: '1.2-2' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReporteIngresosComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);

  readonly cargando = signal(true);
  readonly mensajeError = signal<string | null>(null);

  reporte: IngresoServicioReporte[] = [];
  desde = '';
  hasta = '';

  get sumaCantidadTotal(): number {
    return this.reporte.reduce((acc, curr) => acc + (Number(curr.cantidadTotal) || 0), 0);
  }

  get sumaImporteTotal(): number {
    return this.reporte.reduce((acc, curr) => acc + (Number(curr.importeTotal) || 0), 0);
  }

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.reporteService
      .getIngresosPorServicio(this.desde || undefined, this.hasta || undefined)
      .subscribe({
        next: (data) => {
          this.reporte = data;
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          const errDto = err.error as ErrorResponse;
          this.mensajeError.set(errDto?.mensaje || 'Error al obtener el reporte de ingresos.');
        }
      });
  }

  limpiar(): void {
    this.desde = '';
    this.hasta = '';
    this.consultar();
  }
}
