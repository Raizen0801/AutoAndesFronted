import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrdenService } from '../../../core/services/orden.service';
import { VehiculoService } from '../../../core/services/vehiculo.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { VehiculoResponse } from '../../../core/models/vehiculo.models';
import { ServicioResponse } from '../../../core/models/servicio.models';
import { OrdenServicioRequest } from '../../../core/models/orden.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Nueva Orden de Servicio</h2>
          <p class="text-muted small mb-0">Registro cabecera-detalle atómico de trabajo de taller</p>
        </div>
        <a routerLink="/ordenes" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Regresar a Órdenes
        </a>
      </div>

      <!-- Alerta global de error / Reglas RN-03 y RN-04 (409) SIN perder las líneas -->
      <div *ngIf="mensajeErrorGlobal()" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-exclamation-octagon-fill fs-5 me-2"></i>
        <div class="flex-grow-1">{{ mensajeErrorGlobal() }}</div>
      </div>

      <!-- Alerta de éxito con el número de orden generado -->
      <div *ngIf="mensajeExito()" class="alert alert-success d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-check-circle-fill fs-5 me-2"></i>
        <div class="flex-grow-1">{{ mensajeExito() }}</div>
      </div>

      <form [formGroup]="ordenForm" (ngSubmit)="registrar()">
        <!-- CABECERA DE LA ORDEN -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="card-title fw-bold mb-0 text-primary">
              <i class="bi bi-car-front me-2"></i>1. Datos del Vehículo y Kilometraje
            </h5>
          </div>
          <div class="card-body p-4">
            <div class="row g-3">
              <!-- Vehículo (Combo con placa y cliente) -->
              <div class="col-md-7">
                <label for="vehiculoId" class="form-label fw-semibold small text-muted">
                  Vehículo (Placa - Propietario) <span class="text-danger">*</span>
                </label>
                <select
                  id="vehiculoId"
                  class="form-select"
                  formControlName="vehiculoId"
                  [ngClass]="{ 'is-invalid': tieneError('vehiculoId') }"
                >
                  <option [ngValue]="null">-- Seleccione Vehículo --</option>
                  <option *ngFor="let v of vehiculos" [ngValue]="v.id">
                    {{ v.placa }} - {{ v.marca }} {{ v.modelo }} (Cliente: {{ v.clienteNombre }})
                  </option>
                </select>
                <div *ngIf="tieneError('vehiculoId')" class="invalid-feedback d-block">
                  Debe seleccionar un vehículo para la orden.
                </div>
              </div>

              <!-- Kilometraje -->
              <div class="col-md-5">
                <label for="kilometraje" class="form-label fw-semibold small text-muted">
                  Kilometraje Actual <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input
                    type="number"
                    id="kilometraje"
                    class="form-control"
                    formControlName="kilometraje"
                    placeholder="Ej. 45500"
                    [ngClass]="{ 'is-invalid': tieneError('kilometraje') }"
                  />
                  <span class="input-group-text">km</span>
                </div>
                <div class="form-text small">RN-04: No puede ser menor a la última orden REGISTRADA.</div>
                <div *ngIf="tieneError('kilometraje')" class="invalid-feedback d-block">
                  El kilometraje debe ser mayor que cero.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- DETALLE DINÁMICO DE SERVICIOS -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white py-3 d-flex align-items-center justify-content-between">
            <h5 class="card-title fw-bold mb-0 text-primary">
              <i class="bi bi-wrench-adjustable me-2"></i>2. Servicios a Realizar
            </h5>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
              (click)="agregarDetalle()"
              [disabled]="detallesArray.length >= 10"
            >
              <i class="bi bi-plus-lg"></i>
              <span>Agregar Servicio</span>
            </button>
          </div>
          <div class="card-body p-4">
            <div class="table-responsive">
              <table class="table table-bordered align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 50px;" class="text-center">#</th>
                    <th>Servicio Mecánico <span class="text-danger">*</span></th>
                    <th style="width: 130px;" class="text-end">Precio (S/)</th>
                    <th style="width: 140px;" class="text-center">Cantidad <span class="text-danger">*</span></th>
                    <th style="width: 150px;" class="text-end">Subtotal (S/)</th>
                    <th style="width: 70px;" class="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody formArrayName="detalles">
                  <tr *ngFor="let detGroup of detallesArray.controls; let i = index" [formGroupName]="i">
                    <td class="text-center fw-semibold text-muted">{{ i + 1 }}</td>

                    <!-- Selector de Servicio -->
                    <td>
                      <select
                        class="form-select form-select-sm"
                        formControlName="servicioId"
                        (change)="onServicioCambiado(i)"
                      >
                        <option [ngValue]="null">-- Seleccione Servicio --</option>
                        <option
                          *ngFor="let s of servicios"
                          [ngValue]="s.id"
                          [disabled]="!s.activo"
                        >
                          {{ s.codigo }} - {{ s.nombre }} (S/ {{ s.precio | number: '1.2-2' }})
                          {{ !s.activo ? ' [INACTIVO]' : '' }}
                        </option>
                      </select>
                      <div *ngIf="esServicioDuplicado(i)" class="text-danger small mt-1">
                        <i class="bi bi-exclamation-circle me-1"></i>Servicio repetido en otra línea (RN-03).
                      </div>
                    </td>

                    <!-- Precio Unitario de referencia -->
                    <td class="text-end text-muted">
                      S/ {{ obtenerPrecioServicio(i) | number: '1.2-2' }}
                    </td>

                    <!-- Cantidad (1 a 5 según RN-03) -->
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        class="form-control form-control-sm text-center"
                        formControlName="cantidad"
                        (input)="calcularTotales()"
                      />
                    </td>

                    <!-- Subtotal Calculado al instante -->
                    <td class="text-end fw-bold text-dark">
                      S/ {{ calcularSubtotalFila(i) | number: '1.2-2' }}
                    </td>

                    <!-- Quitar Línea -->
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        (click)="quitarDetalle(i)"
                        [disabled]="detallesArray.length <= 1"
                        title="Quitar servicio"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-light fs-5">
                    <td colspan="4" class="text-end fw-bold text-secondary">TOTAL CALCULADO:</td>
                    <td class="text-end fw-bold text-success">
                      S/ {{ totalCalculado | number: '1.2-2' }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="small text-muted mt-2">
              <i class="bi bi-info-circle me-1"></i>
              <strong>Reglas RN-03 y RN-04:</strong> Mínimo 1 y máximo 10 detalles; cantidad entre 1 y 5; sin servicios repetidos. El precio unitario y total final se validan atómicamente contra la base de datos en el backend.
            </div>
          </div>
        </div>

        <!-- BOTONES DE ACCIÓN -->
        <div class="d-flex align-items-center justify-content-end gap-2 mb-5">
          <a routerLink="/ordenes" class="btn btn-outline-secondary px-4">Cancelar</a>
          <button
            type="submit"
            class="btn btn-success px-5 py-2 fw-semibold d-flex align-items-center gap-2"
            [disabled]="ordenForm.invalid || tieneDuplicados() || guardando()"
          >
            <span *ngIf="guardando()" class="spinner-border spinner-border-sm" role="status"></span>
            <i *ngIf="!guardando()" class="bi bi-check2-circle fs-5"></i>
            <span>{{ guardando() ? 'Registrando en Base de Datos...' : 'Registrar Orden de Servicio' }}</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class OrdenFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ordenService = inject(OrdenService);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly servicioService = inject(ServicioService);
  private readonly router = inject(Router);

  readonly guardando = signal(false);
  readonly mensajeErrorGlobal = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  vehiculos: VehiculoResponse[] = [];
  servicios: ServicioResponse[] = [];
  totalCalculado = 0;

  readonly ordenForm: FormGroup = this.fb.group({
    vehiculoId: [null, [Validators.required]],
    kilometraje: [null, [Validators.required, Validators.min(1)]],
    detalles: this.fb.array([])
  });

  get detallesArray(): FormArray {
    return this.ordenForm.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    this.cargarDatosMaestros();
    this.agregarDetalle(); // Agregar 1 línea por defecto
  }

  cargarDatosMaestros(): void {
    this.vehiculoService.getVehiculos().subscribe({
      next: (data) => (this.vehiculos = data),
      error: () => this.mensajeErrorGlobal.set('No se pudieron cargar los vehículos.')
    });

    this.servicioService.getServicios().subscribe({
      next: (data) => (this.servicios = data),
      error: () => this.mensajeErrorGlobal.set('No se pudieron cargar los servicios.')
    });
  }

  crearDetalleGroup(): FormGroup {
    return this.fb.group({
      servicioId: [null, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  agregarDetalle(): void {
    if (this.detallesArray.length < 10) {
      this.detallesArray.push(this.crearDetalleGroup());
      this.calcularTotales();
    }
  }

  quitarDetalle(index: number): void {
    if (this.detallesArray.length > 1) {
      this.detallesArray.removeAt(index);
      this.calcularTotales();
    }
  }

  onServicioCambiado(index: number): void {
    this.calcularTotales();
  }

  obtenerPrecioServicio(index: number): number {
    const sId = this.detallesArray.at(index).get('servicioId')?.value;
    if (!sId) return 0;
    const serv = this.servicios.find((s) => s.id === sId);
    return serv ? serv.precio : 0;
  }

  calcularSubtotalFila(index: number): number {
    const precio = this.obtenerPrecioServicio(index);
    const cantidad = Number(this.detallesArray.at(index).get('cantidad')?.value || 0);
    return precio * cantidad;
  }

  calcularTotales(): void {
    let sum = 0;
    for (let i = 0; i < this.detallesArray.length; i++) {
      sum += this.calcularSubtotalFila(i);
    }
    this.totalCalculado = sum;
  }

  esServicioDuplicado(index: number): boolean {
    const sId = this.detallesArray.at(index).get('servicioId')?.value;
    if (!sId) return false;
    let ocurrencias = 0;
    for (let i = 0; i < this.detallesArray.length; i++) {
      if (this.detallesArray.at(i).get('servicioId')?.value === sId) {
        ocurrencias++;
      }
    }
    return ocurrencias > 1;
  }

  tieneDuplicados(): boolean {
    const ids = this.detallesArray.controls
      .map((c) => c.get('servicioId')?.value)
      .filter((id) => !!id);
    return new Set(ids).size !== ids.length;
  }

  tieneError(campo: string): boolean {
    const c = this.ordenForm.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  registrar(): void {
    if (this.ordenForm.invalid || this.tieneDuplicados()) {
      this.ordenForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeErrorGlobal.set(null);

    const formValue = this.ordenForm.value;
    const payload: OrdenServicioRequest = {
      vehiculoId: formValue.vehiculoId,
      kilometraje: Number(formValue.kilometraje),
      detalles: formValue.detalles.map((d: any) => ({
        servicioId: d.servicioId,
        cantidad: Number(d.cantidad)
      }))
    };

    this.ordenService.registrarOrden(payload).subscribe({
      next: (ordenCreada) => {
        this.guardando.set(false);
        this.mensajeExito.set(
          `¡Orden ${ordenCreada.numero} registrada exitosamente! Total calculado: S/ ${ordenCreada.total.toFixed(2)}.`
        );
        setTimeout(() => this.router.navigate(['/ordenes']), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        // Reglas RN-03 (servicios inactivos, duplicados) o RN-04 (kilometraje menor) -> 409 o 400
        // Se muestra el mensaje en la pantalla SIN perder las líneas que el usuario escribió
        const errDto = err.error as ErrorResponse;
        this.mensajeErrorGlobal.set(
          errDto?.mensaje || `Error ${err.status}: No se pudo registrar la orden de servicio.`
        );
      }
    });
  }
}
