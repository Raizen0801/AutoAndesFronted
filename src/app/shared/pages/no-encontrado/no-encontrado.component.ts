import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="card shadow-sm border-0 mx-auto" style="max-width: 500px;">
        <div class="card-body p-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
          <h1 class="display-4 fw-bold mt-2">404</h1>
          <h3 class="text-secondary">Página No Encontrada</h3>
          <p class="text-muted mt-2">
            La ruta a la que intentas acceder no existe en el sistema AutoAndes.
          </p>
          <div class="mt-4">
            <a routerLink="/servicios" class="btn btn-outline-primary px-4">
              <i class="bi bi-arrow-left me-2"></i>Volver
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NoEncontradoComponent {}
