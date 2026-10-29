import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Permiso } from '../auth/auth.models';

export const permisoGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const permisoRequerido = route.data['permiso'] as Permiso | undefined;
  const permisosRequeridos = route.data['permisos'] as Permiso[] | undefined;

  if (permisoRequerido && !authService.tienePermiso(permisoRequerido)) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  if (permisosRequeridos && !authService.tieneCualquiera(permisosRequeridos)) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  return true;
};
