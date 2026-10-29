import { Permiso } from '../auth/auth.models';

export interface MenuItem {
  titulo: string;
  ruta: string;
  icono: string;
  permiso?: Permiso;
  exacto?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    titulo: 'Servicios',
    ruta: '/servicios',
    icono: 'bi-tools',
    permiso: 'SERVICIO_LEER'
  },
  {
    titulo: 'Vehículos',
    ruta: '/vehiculos',
    icono: 'bi-car-front',
    permiso: 'VEHICULO_LEER'
  },
  {
    titulo: 'Órdenes de Servicio',
    ruta: '/ordenes',
    icono: 'bi-clipboard-check',
    permiso: 'ORDEN_LEER',
    exacto: true
  },
  {
    titulo: 'Nueva Orden',
    ruta: '/ordenes/nueva',
    icono: 'bi-plus-circle',
    permiso: 'ORDEN_REGISTRAR'
  },
  {
    titulo: 'Reporte de Ingresos',
    ruta: '/reportes',
    icono: 'bi-graph-up',
    permiso: 'REPORTE_VER'
  }
];
