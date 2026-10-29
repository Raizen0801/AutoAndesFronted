import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { permisoGuard } from './core/guards/permiso.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'acceso-denegado',
    loadComponent: () =>
      import('./shared/pages/acceso-denegado/acceso-denegado.component').then(
        (m) => m.AccesoDenegadoComponent
      )
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'servicios',
        pathMatch: 'full'
      },
      // SERVICIOS
      {
        path: 'servicios',
        canActivate: [permisoGuard],
        data: { permiso: 'SERVICIO_LEER' },
        loadComponent: () =>
          import('./features/servicios/servicios-list/servicios-list.component').then(
            (m) => m.ServiciosListComponent
          )
      },
      {
        path: 'servicios/nuevo',
        canActivate: [permisoGuard],
        data: { permiso: 'SERVICIO_ESCRIBIR' },
        loadComponent: () =>
          import('./features/servicios/servicio-form/servicio-form.component').then(
            (m) => m.ServicioFormComponent
          )
      },
      {
        path: 'servicios/:id/editar',
        canActivate: [permisoGuard],
        data: { permiso: 'SERVICIO_ESCRIBIR' },
        loadComponent: () =>
          import('./features/servicios/servicio-form/servicio-form.component').then(
            (m) => m.ServicioFormComponent
          )
      },
      // VEHICULOS
      {
        path: 'vehiculos',
        canActivate: [permisoGuard],
        data: { permiso: 'VEHICULO_LEER' },
        loadComponent: () =>
          import('./features/vehiculos/vehiculos-list/vehiculos-list.component').then(
            (m) => m.VehiculosListComponent
          )
      },
      {
        path: 'vehiculos/nuevo',
        canActivate: [permisoGuard],
        data: { permiso: 'VEHICULO_ESCRIBIR' },
        loadComponent: () =>
          import('./features/vehiculos/vehiculo-form/vehiculo-form.component').then(
            (m) => m.VehiculoFormComponent
          )
      },
      {
        path: 'vehiculos/:id/editar',
        canActivate: [permisoGuard],
        data: { permiso: 'VEHICULO_ESCRIBIR' },
        loadComponent: () =>
          import('./features/vehiculos/vehiculo-form/vehiculo-form.component').then(
            (m) => m.VehiculoFormComponent
          )
      },
      // ORDENES
      {
        path: 'ordenes',
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_LEER' },
        loadComponent: () =>
          import('./features/ordenes/ordenes-list/ordenes-list.component').then(
            (m) => m.OrdenesListComponent
          )
      },
      {
        path: 'ordenes/nueva',
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_REGISTRAR' },
        loadComponent: () =>
          import('./features/ordenes/orden-form/orden-form.component').then(
            (m) => m.OrdenFormComponent
          )
      },
      // REPORTES
      {
        path: 'reportes',
        canActivate: [permisoGuard],
        data: { permiso: 'REPORTE_VER' },
        loadComponent: () =>
          import('./features/reportes/reporte-ingresos/reporte-ingresos.component').then(
            (m) => m.ReporteIngresosComponent
          )
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/no-encontrado/no-encontrado.component').then(
        (m) => m.NoEncontradoComponent
      )
  }
];
