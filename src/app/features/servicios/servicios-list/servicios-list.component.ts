import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServicioService } from '../../../core/services/servicio.service';
import { ServicioResponse } from '../../../core/models/servicio.models';
import { SiPermisoDirective } from '../../../shared/directives/si-permiso.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SiPermisoDirective],
  template: `
    <div class="container-fluid px-0">
      <!-- Encabezado de página -->
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Catálogo de Servicios</h2>
          <p class="text-muted small mb-0">Gestión de servicios mecánicos y tarifas</p>
        </div>
        <div *appSiPermiso="'SERVICIO_ESCRIBIR'">
          <a routerLink="/servicios/nuevo" class="btn btn-primary d-flex align-items-center gap-2">
            <i class="bi bi-plus-lg"></i>
            <span>Nuevo Servicio</span>
          </a>
        </div>
      </div>

      <!-- Alerta global de error / negocio (RN-01) -->
      <div *ngIf="mensajeError()" class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
        <div class="flex-grow-1">{{ mensajeError() }}</div>
        <button type="button" class="btn-close" (click)="mensajeError.set(null)" aria-label="Close"></button>
      </div>

      <!-- Alerta de éxito -->
      <div *ngIf="mensajeExito()" class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
        <i class="bi bi-check-circle-fill fs-5 me-2"></i>
        <div class="flex-grow-1">{{ mensajeExito() }}</div>
        <button type="button" class="btn-close" (click)="mensajeExito.set(null)" aria-label="Close"></button>
      </div>

      <!-- Filtro y buscador -->
      <div class="card shadow-sm border-0 mb-3">
        <div class="card-body p-3">
          <div class="row g-2 align-items-center">
            <div class="col-md-6 col-lg-4">
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Buscar por código o nombre..."
                  [(ngModel)]="terminoBusqueda"
                  (ngModelChange)="filtrar()"
                />
              </div>
            </div>
            <div class="col-auto ms-auto">
              <button class="btn btn-outline-secondary btn-sm" (click)="cargarServicios()">
                <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado: Cargando -->
      <div *ngIf="cargando()" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted small mt-2">Cargando catálogo de servicios...</p>
      </div>

      <!-- Tabla de resultados -->
      <div *ngIf="!cargando()" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 110px;">Código</th>
                <th>Nombre del Servicio</th>
                <th class="text-end" style="width: 120px;">Precio (S/)</th>
                <th class="text-center" style="width: 130px;">Duración</th>
                <th class="text-center" style="width: 100px;">Estado</th>
                <th class="text-end" style="width: 180px;" *appSiPermiso="'SERVICIO_ESCRIBIR'">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Lista Vacía -->
              <tr *ngIf="serviciosFiltrados.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  No se encontraron servicios registrados con los criterios especificados.
                </td>
              </tr>

              <tr *ngFor="let s of serviciosFiltrados">
                <td>
                  <span class="badge bg-secondary font-monospace">{{ s.codigo }}</span>
                </td>
                <td class="fw-semibold text-dark">{{ s.nombre }}</td>
                <td class="text-end fw-bold text-primary">S/ {{ s.precio | number: '1.2-2' }}</td>
                <td class="text-center">
                  <span class="badge text-bg-light border">
                    <i class="bi bi-clock me-1"></i>{{ s.duracionMin }} min
                  </span>
                </td>
                <td class="text-center">
                  <span
                    class="badge"
                    [ngClass]="s.activo ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'"
                  >
                    {{ s.activo ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </td>
                <td class="text-end" *appSiPermiso="'SERVICIO_ESCRIBIR'">
                  <div class="btn-group btn-group-sm">
                    <!-- Editar -->
                    <a [routerLink]="['/servicios', s.id, 'editar']" class="btn btn-outline-primary" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </a>

                    <!-- Toggle Activo / Inactivo (RN-01 PATCH) -->
                    <button
                      type="button"
                      class="btn"
                      [ngClass]="s.activo ? 'btn-outline-warning' : 'btn-outline-success'"
                      (click)="alternarEstado(s)"
                      [title]="s.activo ? 'Dar de baja (Inactivar)' : 'Reactivar'"
                    >
                      <i class="bi" [ngClass]="s.activo ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                    </button>

                    <!-- Eliminar Físico (Demuestra RN-01 -> 409 si tiene órdenes) -->
                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      (click)="eliminar(s)"
                      title="Eliminar registro"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ServiciosListComponent implements OnInit {
  private readonly servicioService = inject(ServicioService);

  readonly cargando = signal(true);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  servicios: ServicioResponse[] = [];
  serviciosFiltrados: ServicioResponse[] = [];
  terminoBusqueda = '';

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.servicioService.getServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.filtrar();
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        const errDto = err.error as ErrorResponse;
        this.mensajeError.set(errDto?.mensaje || 'Error al cargar la lista de servicios.');
      }
    });
  }

  filtrar(): void {
    const term = this.terminoBusqueda.toLowerCase().trim();
    if (!term) {
      this.serviciosFiltrados = [...this.servicios];
      return;
    }
    this.serviciosFiltrados = this.servicios.filter(
      (s) => s.codigo.toLowerCase().includes(term) || s.nombre.toLowerCase().includes(term)
    );
  }

  alternarEstado(s: ServicioResponse): void {
    const accion = s.activo ? 'dar de baja (inactivar)' : 'reactivar';
    if (!confirm(`¿Estás seguro de que deseas ${accion} el servicio "${s.nombre}"?`)) {
      return;
    }

    this.servicioService.cambiarEstado(s.id, !s.activo).subscribe({
      next: (actualizado) => {
        s.activo = actualizado.activo;
        this.mensajeExito.set(`Servicio ${s.codigo} ahora está ${s.activo ? 'ACTIVO' : 'INACTIVO'}.`);
        setTimeout(() => this.mensajeExito.set(null), 4000);
      },
      error: (err: HttpErrorResponse) => {
        const errDto = err.error as ErrorResponse;
        this.mensajeError.set(errDto?.mensaje || 'No se pudo cambiar el estado del servicio.');
      }
    });
  }

  eliminar(s: ServicioResponse): void {
    if (!confirm(`¿Deseas eliminar definitivamente el servicio "${s.codigo} - ${s.nombre}"? Si tiene órdenes asociadas se rechazará con 409.`)) {
      return;
    }

    this.servicioService.eliminarServicio(s.id).subscribe({
      next: () => {
        this.servicios = this.servicios.filter((x) => x.id !== s.id);
        this.filtrar();
        this.mensajeExito.set(`Servicio ${s.codigo} eliminado correctamente.`);
        setTimeout(() => this.mensajeExito.set(null), 4000);
      },
      error: (err: HttpErrorResponse) => {
        // En RN-01, si tiene órdenes el backend responde 409 con mensaje específico
        const errDto = err.error as ErrorResponse;
        this.mensajeError.set(errDto?.mensaje || `Error ${err.status}: No se pudo eliminar el servicio.`);
      }
    });
  }
}
