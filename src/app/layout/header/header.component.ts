import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm border-bottom border-secondary">
      <div class="container-fluid">
        <span class="navbar-brand fw-bold d-flex align-items-center gap-2">
          <i class="bi bi-speedometer2 text-warning"></i>
          <span>AutoAndes Web</span>
        </span>

        <div class="d-flex align-items-center gap-3">
          <div class="text-light text-end d-none d-sm-block">
            <div class="fw-semibold small">{{ authService.usuarioNombre() }}</div>
            <div class="text-secondary" style="font-size: 0.75rem;">
              {{ authService.roles().join(', ') }}
            </div>
          </div>
          <button (click)="logout()" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-box-arrow-right"></i>
            <span class="d-none d-md-inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
