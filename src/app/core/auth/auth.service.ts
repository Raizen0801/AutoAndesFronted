import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Permiso, SesionUsuario } from './auth.models';

const STORAGE_KEY = 'autoandes_session';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signal reactivo para el estado de la sesión
  private readonly sesionSignal = signal<SesionUsuario | null>(this.obtenerSesionInicial());

  // Señales públicas calculadas
  readonly sesion = this.sesionSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sesionSignal() && !this.esTokenExpirado());
  readonly usuarioNombre = computed(() => this.sesionSignal()?.nombreCompleto ?? '');
  readonly roles = computed(() => this.sesionSignal()?.roles ?? []);
  readonly permisos = computed(() => this.sesionSignal()?.permisos ?? []);

  private logoutTimer?: any;

  constructor() {
    this.iniciarTemporizadorExpiracion();
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((resp) => {
        const expiraEn = Date.now() + resp.expiraEnSegundos * 1000;
        const sesion: SesionUsuario = {
          token: resp.token,
          nombreCompleto: resp.nombreCompleto,
          roles: resp.roles,
          permisos: resp.permisos,
          expiraEn
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
        this.sesionSignal.set(sesion);
        this.programarCierreAutomatico(resp.expiraEnSegundos * 1000);
      })
    );
  }

  logout(redirigirUrl?: string): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = undefined;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    this.sesionSignal.set(null);
    if (redirigirUrl) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: redirigirUrl } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    if (this.esTokenExpirado()) {
      this.logout();
      return null;
    }
    return this.sesionSignal()?.token ?? null;
  }

  tienePermiso(permiso: Permiso): boolean {
    const lista = this.permisos();
    return lista.includes(permiso);
  }

  tieneCualquiera(permisosRequeridos: Permiso[]): boolean {
    if (!permisosRequeridos || permisosRequeridos.length === 0) return true;
    const lista = this.permisos();
    return permisosRequeridos.some((p) => lista.includes(p));
  }

  private esTokenExpirado(): boolean {
    const s = this.sesionSignal();
    if (!s) return true;
    return Date.now() >= s.expiraEn;
  }

  private obtenerSesionInicial(): SesionUsuario | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: SesionUsuario = JSON.parse(raw);
      if (Date.now() >= parsed.expiraEn) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private iniciarTemporizadorExpiracion(): void {
    const s = this.sesionSignal();
    if (s) {
      const tiempoRestante = s.expiraEn - Date.now();
      if (tiempoRestante > 0) {
        this.programarCierreAutomatico(tiempoRestante);
      } else {
        this.logout();
      }
    }
  }

  private programarCierreAutomatico(milisegundos: number): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.logoutTimer = setTimeout(() => {
      console.warn('Sesión expirada automáticamente.');
      this.logout();
    }, milisegundos);
  }
}
