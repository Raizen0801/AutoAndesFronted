import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehiculoService } from '../../../core/services/vehiculo.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-vehiculo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="fw-bold mb-1 text-dark">
            {{ esEdicion() ? 'Editar Vehículo' : 'Nuevo Vehículo' }}
          </h2>
          <p class="text-muted small mb-0">
            {{ esEdicion() ? 'Actualice la información del vehículo' : 'Registre un nuevo vehículo en el sistema' }}
          </p>
        </div>
        <a routerLink="/vehiculos" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Regresar a la lista
        </a>
      </div>

      <!-- Alerta global / 409 RN-02 (Placa repetida) -->
      <div *ngIf="mensajeErrorGlobal()" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-exclamation-octagon-fill fs-5 me-2"></i>
        <div>{{ mensajeErrorGlobal() }}</div>
      </div>

      <div *ngIf="mensajeExito()" class="alert alert-success d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-check-circle-fill fs-5 me-2"></i>
        <div>{{ mensajeExito() }}</div>
      </div>

      <div class="card shadow-sm border-0" style="max-width: 800px;">
        <div class="card-body p-4">
          <form [formGroup]="vehiculoForm" (ngSubmit)="guardar()">
            <div class="row g-3">
              <!-- Placa -->
              <div class="col-md-6">
                <label for="placa" class="form-label fw-semibold small text-muted">
                  Placa del Vehículo <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="placa"
                  class="form-control text-uppercase"
                  formControlName="placa"
                  placeholder="Ej. ABC-123"
                  [ngClass]="{ 'is-invalid': tieneError('placa') }"
                />
                <div class="form-text small">Formato requerido: ABC-123 (3 letras, guión y 3 números).</div>
                <div *ngIf="tieneError('placa')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('placa') }}
                </div>
              </div>

              <!-- Cliente (Lista Desplegable desde el Backend) -->
              <div class="col-md-6">
                <label for="clienteId" class="form-label fw-semibold small text-muted">
                  Propietario / Cliente <span class="text-danger">*</span>
                </label>
                <select
                  id="clienteId"
                  class="form-select"
                  formControlName="clienteId"
                  [ngClass]="{ 'is-invalid': tieneError('clienteId') }"
                >
                  <option [ngValue]="null">-- Seleccione Cliente --</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.id">
                    {{ c.nombres }} (Doc: {{ c.documento }})
                  </option>
                </select>
                <div *ngIf="tieneError('clienteId')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('clienteId') }}
                </div>
              </div>

              <!-- Marca -->
              <div class="col-md-4">
                <label for="marca" class="form-label fw-semibold small text-muted">
                  Marca <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="marca"
                  class="form-control"
                  formControlName="marca"
                  placeholder="Ej. Toyota"
                  [ngClass]="{ 'is-invalid': tieneError('marca') }"
                />
                <div *ngIf="tieneError('marca')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('marca') }}
                </div>
              </div>

              <!-- Modelo -->
              <div class="col-md-4">
                <label for="modelo" class="form-label fw-semibold small text-muted">
                  Modelo <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="modelo"
                  class="form-control"
                  formControlName="modelo"
                  placeholder="Ej. Yaris"
                  [ngClass]="{ 'is-invalid': tieneError('modelo') }"
                />
                <div *ngIf="tieneError('modelo')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('modelo') }}
                </div>
              </div>

              <!-- Año -->
              <div class="col-md-4">
                <label for="anio" class="form-label fw-semibold small text-muted">
                  Año de Fabricación <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="anio"
                  class="form-control"
                  formControlName="anio"
                  placeholder="Ej. 2022"
                  [ngClass]="{ 'is-invalid': tieneError('anio') }"
                />
                <div class="form-text small">Rango válido: 1990 a 2027.</div>
                <div *ngIf="tieneError('anio')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('anio') }}
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
              <a routerLink="/vehiculos" class="btn btn-outline-secondary px-4">Cancelar</a>
              <button
                type="submit"
                class="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                [disabled]="vehiculoForm.invalid || guardando()"
              >
                <span *ngIf="guardando()" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>{{ guardando() ? 'Guardando...' : (esEdicion() ? 'Actualizar Vehículo' : 'Registrar Vehículo') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class VehiculoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly esEdicion = signal(false);
  readonly guardando = signal(false);
  readonly mensajeErrorGlobal = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly erroresBackend = signal<Record<string, string>>({});

  clientes: Cliente[] = [];
  vehiculoId?: number;

  readonly vehiculoForm: FormGroup = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [null, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarClientes();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.vehiculoId = Number(idParam);
      this.esEdicion.set(true);
      this.cargarVehiculo(this.vehiculoId);
    }
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => (this.clientes = data),
      error: () => this.mensajeErrorGlobal.set('No se pudieron cargar los clientes del backend.')
    });
  }

  cargarVehiculo(id: number): void {
    this.vehiculoService.getVehiculo(id).subscribe({
      next: (v) => {
        this.vehiculoForm.patchValue({
          placa: v.placa,
          marca: v.marca,
          modelo: v.modelo,
          anio: v.anio,
          clienteId: v.clienteId
        });
      },
      error: (err: HttpErrorResponse) => {
        const errDto = err.error as ErrorResponse;
        this.mensajeErrorGlobal.set(errDto?.mensaje || 'Vehículo no encontrado.');
      }
    });
  }

  tieneError(campo: string): boolean {
    if (this.erroresBackend()[campo]) return true;
    const c = this.vehiculoForm.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  obtenerMensajeError(campo: string): string {
    if (this.erroresBackend()[campo]) {
      return this.erroresBackend()[campo];
    }
    const c = this.vehiculoForm.get(campo);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio.';
    if (c.errors['pattern']) return 'Formato inválido. Debe coincidir con ABC-123.';
    if (c.errors['min']) return `Año mínimo permitido: ${c.errors['min'].min}.`;
    if (c.errors['max']) return `Año máximo permitido: ${c.errors['max'].max}.`;
    return 'Campo inválido.';
  }

  guardar(): void {
    if (this.vehiculoForm.invalid) {
      this.vehiculoForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeErrorGlobal.set(null);
    this.erroresBackend.set({});

    const datos = this.vehiculoForm.value;

    const operacion$ = this.esEdicion() && this.vehiculoId
      ? this.vehiculoService.actualizarVehiculo(this.vehiculoId, datos)
      : this.vehiculoService.crearVehiculo(datos);

    operacion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensajeExito.set(this.esEdicion() ? 'Vehículo actualizado con éxito.' : 'Vehículo registrado con éxito.');
        setTimeout(() => this.router.navigate(['/vehiculos']), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        const errDto = err.error as ErrorResponse;
        if (err.status === 400 && errDto?.campos) {
          this.erroresBackend.set(errDto.campos);
        } else if (err.status === 409 || err.status === 404) {
          // RN-02: 409 placa duplicada o 404 cliente no existe
          this.mensajeErrorGlobal.set(errDto?.mensaje || `Error ${err.status}: Conflicto con regla de negocio.`);
        } else {
          this.mensajeErrorGlobal.set(errDto?.mensaje || 'Error inesperado al guardar el vehículo.');
        }
      }
    });
  }
}
