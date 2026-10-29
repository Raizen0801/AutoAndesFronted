import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="card shadow-sm border-0 mx-auto" style="max-width: 500px;">
        <div class="card-body p-5">
          <i class="bi bi-shield-lock-fill text-danger" style="font-size: 4rem;"></i>
          <h2 class="mt-3 text-danger fw-bold">Acceso Denegado</h2>
          <p class="text-muted mt-2">
            No tienes los permisos requeridos para acceder a este recurso o ejecutar esta operación.
          </p>
          <div class="mt-4">
            <a routerLink="/servicios" class="btn btn-primary px-4">
              <i class="bi bi-house-door me-2"></i>Ir al Inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccesoDenegadoComponent {}
