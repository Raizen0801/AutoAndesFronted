import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../core/models/error.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-dark py-4">
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style="max-width: 440px; width: 100%;">
        <div class="bg-primary text-white p-4 text-center">
          <i class="bi bi-speedometer2" style="font-size: 2.8rem;"></i>
          <h3 class="fw-bold mt-2 mb-0">AutoAndes Web</h3>
          <p class="small text-white-50 mb-0">Gestión Integral de Órdenes de Servicio</p>
        </div>

        <div class="card-body p-4 p-md-5">
          <h4 class="card-title fw-bold text-center mb-4 text-secondary">Iniciar Sesión</h4>

          <!-- Alerta de error -->
          <div *ngIf="errorMessage()" class="alert alert-danger d-flex align-items-center small py-2 px-3" role="alert">
            <i class="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
            <div>{{ errorMessage() }}</div>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="username" class="form-label fw-semibold small text-muted">Usuario</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
                <input
                  type="text"
                  id="username"
                  class="form-control"
                  formControlName="username"
                  placeholder="Ej. asesor"
                  [ngClass]="{ 'is-invalid': esInvalido('username') }"
                />
              </div>
              <div *ngIf="esInvalido('username')" class="invalid-feedback d-block small">
                El usuario es requerido.
              </div>
            </div>

            <div class="mb-4">
              <label for="password" class="form-label fw-semibold small text-muted">Contraseña</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-lock"></i></span>
                <input
                  type="password"
                  id="password"
                  class="form-control"
                  formControlName="password"
                  placeholder="••••••••"
                  [ngClass]="{ 'is-invalid': esInvalido('password') }"
                />
              </div>
              <div *ngIf="esInvalido('password')" class="invalid-feedback d-block small">
                La contraseña es requerida.
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
              [disabled]="loginForm.invalid || loading()"
            >
              <span *ngIf="loading()" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>{{ loading() ? 'Autenticando...' : 'Ingresar al Sistema' }}</span>
            </button>
          </form>

          <!-- Tarjetas rápidas de ayuda para la defensa del examen -->
          <div class="mt-4 pt-3 border-top">
            <p class="small text-muted mb-2 text-center fw-semibold">Cuentas de prueba (Examen U2):</p>
            <div class="d-flex flex-wrap gap-1 justify-content-center">
              <button
                type="button"
                (click)="autocompletar('admin', 'Auto2026*')"
                class="btn btn-sm btn-outline-secondary"
              >
                ADMIN
              </button>
              <button
                type="button"
                (click)="autocompletar('asesor', 'Auto2026*')"
                class="btn btn-sm btn-outline-secondary"
              >
                ASESOR
              </button>
              <button
                type="button"
                (click)="autocompletar('jefe', 'Auto2026*')"
                class="btn btn-sm btn-outline-secondary"
              >
                JEFE_TALLER
              </button>
              <button
                type="button"
                (click)="autocompletar('inactivo', 'Auto2026*')"
                class="btn btn-sm btn-outline-danger"
              >
                INACTIVO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  esInvalido(campo: string): boolean {
    const c = this.loginForm.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  autocompletar(user: string, pass: string): void {
    this.loginForm.patchValue({ username: user, password: pass });
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/servicios';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const errDto = err.error as ErrorResponse;
        if (errDto?.mensaje) {
          this.errorMessage.set(errDto.mensaje);
        } else if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas o cuenta inactiva.');
        } else {
          this.errorMessage.set('Ocurrió un error al intentar comunicarse con el servidor.');
        }
      }
    });
  }
}
