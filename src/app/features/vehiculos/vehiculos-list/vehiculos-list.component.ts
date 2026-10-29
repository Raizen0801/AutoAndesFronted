import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VehiculoService } from '../../../core/services/vehiculo.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { VehiculoResponse } from '../../../core/models/vehiculo.models';
import { Cliente } from '../../../core/models/cliente.models';
import { SiPermisoDirective } from '../../../shared/directives/si-permiso.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-vehiculos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SiPermisoDirective],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Gestión de Vehículos</h2>
          <p class="text-muted small mb-0">Control del parque automotor de clientes</p>
        </div>
        <div *appSiPermiso="'VEHICULO_ESCRIBIR'">
          <a routerLink="/vehiculos/nuevo" class="btn btn-primary d-flex align-items-center gap-2">
            <i class="bi bi-plus-lg"></i>
            <span>Nuevo Vehículo</span>
          </a>
        </div>
      </div>

      <!-- Alertas -->
      <div *ngIf="mensajeError()" class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
        <div class="flex-grow-1">{{ mensajeError() }}</div>
        <button type="button" class="btn-close" (click)="mensajeError.set(null)" aria-label="Close"></button>
      </div>

      <div *ngIf="mensajeExito()" class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
        <i class="bi bi-check-circle-fill fs-5 me-2"></i>
        <div class="flex-grow-1">{{ mensajeExito() }}</div>
        <button type="button" class="btn-close" (click)="mensajeExito.set(null)" aria-label="Close"></button>
      </div>

      <!-- Filtros -->
      <div class="card shadow-sm border-0 mb-3">
        <div class="card-body p-3">
          <div class="row g-2 align-items-center">
            <div class="col-md-5 col-lg-4">
              <label class="form-label small text-muted mb-1">Filtrar por Cliente:</label>
              <select
                class="form-select form-select-sm"
                [(ngModel)]="clienteFiltroId"
                (ngModelChange)="cargarVehiculos()"
              >
                <option [ngValue]="null">-- Todos los Clientes --</option>
                <option *ngFor="let c of clientes" [ngValue]="c.id">
                  {{ c.nombres }} ({{ c.documento }})
                </option>
              </select>
            </div>
            <div class="col-md-4 col-lg-4">
              <label class="form-label small text-muted mb-1">Buscar por Placa o Modelo:</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Ej. ABC-123..."
                  [(ngModel)]="terminoBusqueda"
                  (ngModelChange)="filtrarLocal()"
                />
              </div>
            </div>
            <div class="col-auto ms-auto align-self-end">
              <button class="btn btn-outline-secondary btn-sm" (click)="recargarTodo()">
                <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cargando -->
      <div *ngIf="cargando()" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted small mt-2">Cargando vehículos...</p>
      </div>

      <!-- Tabla -->
      <div *ngIf="!cargando()" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 120px;">Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th class="text-center" style="width: 100px;">Año</th>
                <th>Propietario (Cliente)</th>
                <th class="text-end" style="width: 140px;" *appSiPermiso="'VEHICULO_ESCRIBIR'">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="vehiculosFiltrados.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-car-front fs-2 d-block mb-2"></i>
                  No se encontraron vehículos registrados.
                </td>
              </tr>

              <tr *ngFor="let v of vehiculosFiltrados">
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace fs-6">
                    {{ v.placa }}
                  </span>
                </td>
                <td class="fw-semibold">{{ v.marca }}</td>
                <td>{{ v.modelo }}</td>
                <td class="text-center">
                  <span class="badge text-bg-light border">{{ v.anio }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ v.clienteNombre }}</div>
                  <div class="text-muted small">Cliente ID: #{{ v.clienteId }}</div>
                </td>
                <td class="text-end" *appSiPermiso="'VEHICULO_ESCRIBIR'">
                  <div class="btn-group btn-group-sm">
                    <a [routerLink]="['/vehiculos', v.id, 'editar']" class="btn btn-outline-primary" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <!-- Eliminar con prueba RN-02 -->
                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      (click)="eliminar(v)"
                      title="Eliminar vehículo"
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
export class VehiculosListComponent implements OnInit {
  private readonly vehiculoService = inject(VehiculoService);
  private readonly clienteService = inject(ClienteService);

  readonly cargando = signal(true);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  vehiculos: VehiculoResponse[] = [];
  vehiculosFiltrados: VehiculoResponse[] = [];
  clientes: Cliente[] = [];

  clienteFiltroId: number | null = null;
  terminoBusqueda = '';

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarVehiculos();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => (this.clientes = data),
      error: () => console.warn('No se pudieron cargar clientes para el filtro')
    });
  }

  cargarVehiculos(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.vehiculoService.getVehiculos(this.clienteFiltroId ?? undefined).subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.filtrarLocal();
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        const errDto = err.error as ErrorResponse;
        this.mensajeError.set(errDto?.mensaje || 'Error al obtener la lista de vehículos.');
      }
    });
  }

  filtrarLocal(): void {
    const term = this.terminoBusqueda.toLowerCase().trim();
    if (!term) {
      this.vehiculosFiltrados = [...this.vehiculos];
      return;
    }
    this.vehiculosFiltrados = this.vehiculos.filter(
      (v) =>
        v.placa.toLowerCase().includes(term) ||
        v.marca.toLowerCase().includes(term) ||
        v.modelo.toLowerCase().includes(term) ||
        v.clienteNombre.toLowerCase().includes(term)
    );
  }

  recargarTodo(): void {
    this.clienteFiltroId = null;
    this.terminoBusqueda = '';
    this.cargarVehiculos();
  }

  eliminar(v: VehiculoResponse): void {
    if (!confirm(`¿Eliminar vehículo placa "${v.placa}" (${v.marca} ${v.modelo})? Si tiene órdenes asociadas se rechazará con 409.`)) {
      return;
    }

    this.vehiculoService.eliminarVehiculo(v.id).subscribe({
      next: () => {
        this.vehiculos = this.vehiculos.filter((x) => x.id !== v.id);
        this.filtrarLocal();
        this.mensajeExito.set(`Vehículo ${v.placa} eliminado exitosamente.`);
        setTimeout(() => this.mensajeExito.set(null), 4000);
      },
      error: (err: HttpErrorResponse) => {
        // En RN-02, si el vehículo tiene órdenes registradas retorna 409
        const errDto = err.error as ErrorResponse;
        this.mensajeError.set(errDto?.mensaje || `Error ${err.status}: No se pudo eliminar el vehículo.`);
      }
    });
  }
}
