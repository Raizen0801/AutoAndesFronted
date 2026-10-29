import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdenService } from '../../../core/services/orden.service';
import {
  AnularOrdenRequest,
  FiltrosOrdenes,
  OrdenServicioResponse
} from '../../../core/models/orden.models';
import { SiPermisoDirective } from '../../../shared/directives/si-permiso.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SiPermisoDirective],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Órdenes de Servicio</h2>
          <p class="text-muted small mb-0">Seguimiento, auditoría y control de trabajos de taller</p>
        </div>
        <div *appSiPermiso="'ORDEN_REGISTRAR'">
          <a routerLink="/ordenes/nueva" class="btn btn-success d-flex align-items-center gap-2">
            <i class="bi bi-plus-circle"></i>
            <span>Nueva Orden de Servicio</span>
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

      <!-- Filtros del Contrato API -->
      <div class="card shadow-sm border-0 mb-3">
        <div class="card-body p-3">
          <form (ngSubmit)="buscar()" class="row g-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label small text-muted mb-1">Placa:</label>
              <input
                type="text"
                class="form-control form-control-sm text-uppercase"
                placeholder="Ej. AAA-111"
                [(ngModel)]="filtros.placa"
                name="placa"
              />
            </div>
            <div class="col-md-2">
              <label class="form-label small text-muted mb-1">Estado:</label>
              <select class="form-select form-select-sm" [(ngModel)]="filtros.estado" name="estado">
                <option value="">-- Todos --</option>
                <option value="REGISTRADA">REGISTRADA</option>
                <option value="ANULADA">ANULADA</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small text-muted mb-1">Desde:</label>
              <input
                type="date"
                class="form-control form-control-sm"
                [(ngModel)]="filtros.desde"
                name="desde"
              />
            </div>
            <div class="col-md-2">
              <label class="form-label small text-muted mb-1">Hasta:</label>
              <input
                type="date"
                class="form-control form-control-sm"
                [(ngModel)]="filtros.hasta"
                name="hasta"
              />
            </div>
            <div class="col-md-3 d-flex gap-1">
              <button type="submit" class="btn btn-primary btn-sm flex-grow-1">
                <i class="bi bi-filter me-1"></i>Filtrar
              </button>
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="limpiarFiltros()">
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
        <p class="text-muted small mt-2">Consultando órdenes...</p>
      </div>

      <!-- Tabla -->
      <div *ngIf="!cargando()" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 120px;">Número</th>
                <th style="width: 150px;">Fecha</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th class="text-end" style="width: 120px;">Kilometraje</th>
                <th class="text-end" style="width: 130px;">Total</th>
                <th class="text-center" style="width: 120px;">Estado</th>
                <th class="text-end" style="width: 140px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="ordenes.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-clipboard-x fs-2 d-block mb-2"></i>
                  No se encontraron órdenes de servicio con los filtros aplicados.
                </td>
              </tr>

              <tr *ngFor="let o of ordenes">
                <td>
                  <span class="badge bg-dark font-monospace fs-6">{{ o.numero }}</span>
                </td>
                <td class="small">{{ o.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                    {{ o.vehiculoPlaca }}
                  </span>
                </td>
                <td class="fw-semibold">{{ o.clienteNombre }}</td>
                <td class="text-end">{{ o.kilometraje | number }} km</td>
                <td class="text-end fw-bold text-success">S/ {{ o.total | number: '1.2-2' }}</td>
                <td class="text-center">
                  <span
                    class="badge"
                    [ngClass]="o.estado === 'REGISTRADA' ? 'bg-success' : 'bg-danger'"
                  >
                    {{ o.estado }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <!-- Ver Detalle -->
                    <button
                      type="button"
                      class="btn btn-outline-info"
                      (click)="abrirDetalle(o)"
                      title="Ver Detalle de la Orden"
                    >
                      <i class="bi bi-eye"></i>
                    </button>

                    <!-- Anular (RN-05 con permiso ORDEN_ANULAR) -->
                    <button
                      *appSiPermiso="'ORDEN_ANULAR'"
                      type="button"
                      class="btn btn-outline-danger"
                      (click)="prepararAnulacion(o)"
                      [disabled]="o.estado === 'ANULADA'"
                      title="Anular Orden (RN-05)"
                    >
                      <i class="bi bi-slash-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL DETALLE DE ORDEN -->
      <div *ngIf="ordenSeleccionada" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-file-earmark-text me-2"></i>Orden {{ ordenSeleccionada.numero }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="ordenSeleccionada = null"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3 mb-4">
                <div class="col-sm-6">
                  <div class="text-muted small">Vehículo / Placa</div>
                  <div class="fw-bold fs-5 text-primary">{{ ordenSeleccionada.vehiculoPlaca }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-muted small">Propietario</div>
                  <div class="fw-bold">{{ ordenSeleccionada.clienteNombre }}</div>
                </div>
                <div class="col-sm-4">
                  <div class="text-muted small">Kilometraje</div>
                  <div class="fw-semibold">{{ ordenSeleccionada.kilometraje | number }} km</div>
                </div>
                <div class="col-sm-4">
                  <div class="text-muted small">Fecha de Emisión</div>
                  <div>{{ ordenSeleccionada.fecha | date: 'medium' }}</div>
                </div>
                <div class="col-sm-4">
                  <div class="text-muted small">Registrado por</div>
                  <div>{{ ordenSeleccionada.usuarioRegistro }}</div>
                </div>
                <div class="col-12" *ngIf="ordenSeleccionada.motivoAnulacion">
                  <div class="alert alert-danger mb-0 small">
                    <strong>Motivo de Anulación:</strong> {{ ordenSeleccionada.motivoAnulacion }}
                  </div>
                </div>
              </div>

              <h6 class="fw-bold text-secondary border-bottom pb-2 mb-3">Servicios Realizados</h6>
              <div class="table-responsive">
                <table class="table table-sm table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Descripción del Servicio</th>
                      <th class="text-center" style="width: 80px;">Cant.</th>
                      <th class="text-end" style="width: 120px;">Precio Unit.</th>
                      <th class="text-end" style="width: 120px;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let det of ordenSeleccionada.detalles">
                      <td class="font-monospace small">{{ det.servicioCodigo }}</td>
                      <td>{{ det.servicioNombre }}</td>
                      <td class="text-center fw-semibold">{{ det.cantidad }}</td>
                      <td class="text-end">S/ {{ det.precioUnitario | number: '1.2-2' }}</td>
                      <td class="text-end fw-semibold">S/ {{ det.subtotal | number: '1.2-2' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-secondary fs-6">
                      <td colspan="4" class="text-end fw-bold">TOTAL DE LA ORDEN:</td>
                      <td class="text-end fw-bold text-primary">S/ {{ ordenSeleccionada.total | number: '1.2-2' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="ordenSeleccionada = null">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL ANULAR ORDEN (RN-05) -->
      <div *ngIf="ordenParaAnular" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-slash-circle me-2"></i>Anular Orden {{ ordenParaAnular.numero }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="cancelarAnulacion()"></button>
            </div>
            <div class="modal-body p-4">
              <p class="small text-muted">
                Según la regla de negocio <strong>RN-05</strong>, solo se puede anular una orden REGISTRADA emitida el mismo día. Ingrese el motivo de la anulación (de 10 a 200 caracteres).
              </p>

              <div class="mb-3">
                <label for="motivo" class="form-label fw-semibold small">Motivo de Anulación <span class="text-danger">*</span></label>
                <textarea
                  id="motivo"
                  class="form-control"
                  rows="3"
                  placeholder="Ingrese el motivo de anulación detallado (mín. 10 caracteres)..."
                  [(ngModel)]="motivoAnulacion"
                ></textarea>
                <div class="form-text small" [ngClass]="{ 'text-danger': motivoAnulacion.length < 10 }">
                  Longitud: {{ motivoAnulacion.length }}/200 caracteres (mínimo 10).
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="cancelarAnulacion()">Cancelar</button>
              <button
                type="button"
                class="btn btn-danger btn-sm px-3"
                [disabled]="motivoAnulacion.trim().length < 10 || motivoAnulacion.trim().length > 200 || anulando()"
                (click)="confirmarAnulacion()"
              >
                <span *ngIf="anulando()" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <span>Confirmar Anulación</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdenesListComponent implements OnInit {
  private readonly ordenService = inject(OrdenService);

  readonly cargando = signal(true);
  readonly anulando = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  ordenes: OrdenServicioResponse[] = [];
  filtros: FiltrosOrdenes = { placa: '', estado: '', desde: '', hasta: '' };

  ordenSeleccionada: OrdenServicioResponse | null = null;
  ordenParaAnular: OrdenServicioResponse | null = null;
  motivoAnulacion = '';

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.ordenService.getOrdenes(this.filtros).subscribe({
      next: (data) => {
        this.ordenes = data;
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        const errDto = err.error as ErrorResponse;
        this.mensajeError.set(errDto?.mensaje || 'Error al consultar órdenes de servicio.');
      }
    });
  }

  buscar(): void {
    this.cargarOrdenes();
  }

  limpiarFiltros(): void {
    this.filtros = { placa: '', estado: '', desde: '', hasta: '' };
    this.cargarOrdenes();
  }

  abrirDetalle(o: OrdenServicioResponse): void {
    this.ordenSeleccionada = o;
  }

  prepararAnulacion(o: OrdenServicioResponse): void {
    this.ordenParaAnular = o;
    this.motivoAnulacion = '';
  }

  cancelarAnulacion(): void {
    this.ordenParaAnular = null;
    this.motivoAnulacion = '';
  }

  confirmarAnulacion(): void {
    if (!this.ordenParaAnular) return;

    this.anulando.set(true);
    this.mensajeError.set(null);

    const req: AnularOrdenRequest = { motivo: this.motivoAnulacion.trim() };

    this.ordenService.anularOrden(this.ordenParaAnular.id, req).subscribe({
      next: (anulada) => {
        this.anulando.set(false);
        this.mensajeExito.set(`Orden ${anulada.numero} anulada exitosamente.`);
        this.cancelarAnulacion();
        this.cargarOrdenes();
        setTimeout(() => this.mensajeExito.set(null), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.anulando.set(false);
        // Regla RN-05: 400 o 409 con el mensaje del backend
        const errDto = err.error as ErrorResponse;
        this.mensajeError.set(errDto?.mensaje || `Error ${err.status}: No se pudo anular la orden.`);
        this.cancelarAnulacion();
      }
    });
  }
}
