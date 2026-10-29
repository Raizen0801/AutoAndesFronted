import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="d-flex flex-column min-vh-100 bg-light">
      <app-header></app-header>
      <div class="d-flex flex-grow-1">
        <app-sidebar></app-sidebar>
        <main class="flex-grow-1 p-4 overflow-auto" style="max-height: calc(100vh - 56px);">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {}
