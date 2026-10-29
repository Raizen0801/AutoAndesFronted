import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU_ITEMS, MenuItem } from '../../core/config/menu';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SiPermisoDirective],
  template: `
    <aside class="sidebar bg-white border-end shadow-sm d-flex flex-column" style="min-height: calc(100vh - 56px); width: 250px;">
      <div class="p-3 border-bottom text-muted small text-uppercase fw-bold letter-spacing">
        Navegación
      </div>
      <ul class="nav nav-pills flex-column p-2 gap-1 mb-auto">
        <li class="nav-item" *ngFor="let item of items">
          <ng-container *appSiPermiso="item.permiso">
            <a
              [routerLink]="item.ruta"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exacto ?? false }"
              class="nav-link d-flex align-items-center gap-2 py-2 px-3 text-dark rounded-3"
            >
              <i class="bi" [ngClass]="item.icono"></i>
              <span>{{ item.titulo }}</span>
            </a>
          </ng-container>
        </li>
      </ul>

      <div class="p-3 border-top bg-light text-center small text-muted">
        <div><strong>AutoAndes v1.0</strong></div>
        <div style="font-size: 0.75rem;">Examen Práctico U2</div>
      </div>
    </aside>
  `,
  styles: [`
    .nav-link.active {
      background-color: #0d6efd !important;
      color: #fff !important;
      font-weight: 600;
    }
    .nav-link:hover:not(.active) {
      background-color: #f1f3f5;
    }
    .letter-spacing {
      letter-spacing: 0.05rem;
    }
  `]
})
export class SidebarComponent {
  readonly items: MenuItem[] = MENU_ITEMS;
  readonly authService = inject(AuthService);
}
