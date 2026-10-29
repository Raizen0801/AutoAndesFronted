import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicioService } from '../../../core/services/servicio.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="fw-bold mb-1 text-dark">
            {{ esEdicion() ? 'Editar Servicio' : 'Nuevo Servicio' }}
          </h2>
          <p class="text-muted small mb-0">
            {{ esEdicion() ? 'Actualice la información del servicio mecánico' : 'Registre un nuevo servicio en el catálogo' }}
          </p>
        </div>
        <a routerLink="/servicios" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Regresar a la lista
        </a>
      </div>

      <!-- Alerta global de error / RN-01 (409) -->
      <div *ngIf="mensajeErrorGlobal()" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-exclamation-octagon-fill fs-5 me-2"></i>
        <div>{{ mensajeErrorGlobal() }}</div>
      </div>

      <!-- Alerta de éxito -->
      <div *ngIf="mensajeExito()" class="alert alert-success d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-check-circle-fill fs-5 me-2"></i>
        <div>{{ mensajeExito() }}</div>
      </div>

      <div class="card shadow-sm border-0" style="max-width: 800px;">
        <div class="card-body p-4">
          <form [formGroup]="servicioForm" (ngSubmit)="guardar()">
            <div class="row g-3">
              <!-- Código -->
              <div class="col-md-6">
                <label for="codigo" class="form-label fw-semibold small text-muted">
                  Código de Servicio <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="codigo"
                  class="form-control text-uppercase"
                  formControlName="codigo"
                  placeholder="Ej. SRV-001"
                  [ngClass]="{ 'is-invalid': tieneError('codigo') }"
                />
                <div class="form-text small">Formato requerido: SRV-000 (3 letras, guión y 3 dígitos).</div>
                <div *ngIf="tieneError('codigo')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('codigo') }}
                </div>
              </div>

              <!-- Nombre -->
              <div class="col-md-6">
                <label for="nombre" class="form-label fw-semibold small text-muted">
                  Nombre del Servicio <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  class="form-control"
                  formControlName="nombre"
                  placeholder="Ej. Cambio de Aceite Sintético"
                  [ngClass]="{ 'is-invalid': tieneError('nombre') }"
                />
                <div *ngIf="tieneError('nombre')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('nombre') }}
                </div>
              </div>

              <!-- Precio -->
              <div class="col-md-6">
                <label for="precio" class="form-label fw-semibold small text-muted">
                  Precio Unitario (S/) <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">S/</span>
                  <input
                    type="number"
                    step="0.10"
                    id="precio"
                    class="form-control"
                    formControlName="precio"
                    placeholder="0.00"
                    [ngClass]="{ 'is-invalid': tieneError('precio') }"
                  />
                </div>
                <div *ngIf="tieneError('precio')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('precio') }}
                </div>
              </div>

              <!-- Duración -->
              <div class="col-md-6">
                <label for="duracionMin" class="form-label fw-semibold small text-muted">
                  Duración Estimada (Minutos) <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input
                    type="number"
                    id="duracionMin"
                    class="form-control"
                    formControlName="duracionMin"
                    placeholder="Ej. 45"
                    [ngClass]="{ 'is-invalid': tieneError('duracionMin') }"
                  />
                  <span class="input-group-text">min</span>
                </div>
                <div class="form-text small">Debe estar entre 15 y 480 minutos.</div>
                <div *ngIf="tieneError('duracionMin')" class="invalid-feedback d-block">
                  {{ obtenerMensajeError('duracionMin') }}
                </div>
              </div>

              <!-- Estado (solo visible en edición o creación) -->
              <div class="col-12 mt-4">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="activo"
                    formControlName="activo"
                  />
                  <label class="form-check-label fw-semibold" for="activo">
                    Servicio Activo en el Catálogo
                  </label>
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
              <a routerLink="/servicios" class="btn btn-outline-secondary px-4">Cancelar</a>
              <button
                type="submit"
                class="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                [disabled]="servicioForm.invalid || guardando()"
              >
                <span *ngIf="guardando()" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>{{ guardando() ? 'Guardando...' : (esEdicion() ? 'Actualizar Servicio' : 'Registrar Servicio') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ServicioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicioService = inject(ServicioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly esEdicion = signal(false);
  readonly guardando = signal(false);
  readonly mensajeErrorGlobal = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly erroresBackend = signal<Record<string, string>>({});

  servicioId?: number;

  readonly servicioForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [null, [Validators.required, Validators.min(0.01)]],
    duracionMin: [null, [Validators.required, Validators.min(15), Validators.max(480)]],
    activo: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.servicioId = Number(idParam);
      this.esEdicion.set(true);
      this.cargarServicio(this.servicioId);
    }
  }

  cargarServicio(id: number): void {
    this.servicioService.getServicio(id).subscribe({
      next: (s) => {
        this.servicioForm.patchValue({
          codigo: s.codigo,
          nombre: s.nombre,
          precio: s.precio,
          duracionMin: s.duracionMin,
          activo: s.activo
        });
      },
      error: (err: HttpErrorResponse) => {
        const errDto = err.error as ErrorResponse;
        this.mensajeErrorGlobal.set(errDto?.mensaje || 'No se encontró el servicio solicitado.');
      }
    });
  }

  tieneError(campo: string): boolean {
    if (this.erroresBackend()[campo]) return true;
    const c = this.servicioForm.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  obtenerMensajeError(campo: string): string {
    if (this.erroresBackend()[campo]) {
      return this.erroresBackend()[campo];
    }
    const c = this.servicioForm.get(campo);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio.';
    if (c.errors['pattern']) return 'Formato inválido. Debe coincidir con SRV-000.';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['min']) return `El valor mínimo permitido es ${c.errors['min'].min}.`;
    if (c.errors['max']) return `El valor máximo permitido es ${c.errors['max'].max}.`;
    return 'Campo inválido.';
  }

  guardar(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeErrorGlobal.set(null);
    this.erroresBackend.set({});

    const datos = this.servicioForm.value;

    const operacion$ = this.esEdicion() && this.servicioId
      ? this.servicioService.actualizarServicio(this.servicioId, datos)
      : this.servicioService.crearServicio(datos);

    operacion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensajeExito.set(this.esEdicion() ? 'Servicio actualizado con éxito.' : 'Servicio registrado con éxito.');
        setTimeout(() => this.router.navigate(['/servicios']), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        const errDto = err.error as ErrorResponse;
        if (err.status === 400 && errDto?.campos) {
          // Asignar los mensajes del backend a cada campo específico
          this.erroresBackend.set(errDto.campos);
        } else if (err.status === 409 || err.status === 404) {
          this.mensajeErrorGlobal.set(errDto?.mensaje || `Error ${err.status}: Conflicto con regla de negocio.`);
        } else {
          this.mensajeErrorGlobal.set(errDto?.mensaje || 'Error inesperado al guardar el servicio.');
        }
      }
    });
  }
}
