import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401: no autorizado (excepto si ocurrió en la pantalla de login)
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        const returnUrl = router.url;
        authService.logout(returnUrl);
      } else if (error.status === 403) {
        // 403: Prohibido / sin permisos -> NO cerrar sesión, redirigir a acceso denegado
        router.navigate(['/acceso-denegado']);
      }

      return throwError(() => error);
    })
  );
};
