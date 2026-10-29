# AutoAndes Web (SPA Frontend)

Frontend SPA empresarial desarrollado en **Angular 22** con componentes Standalone y Bootstrap 5 para el Sistema de Gestión de Órdenes de Servicio del Taller Mecánico **AutoAndes** (Evaluación Práctica Unidad II - UPeU).

## 🚀 Tecnologías Utilizadas
- **Angular 22.2.x** (Componentes Standalone, Signals, Control Flow moderno, Formularios Reactivos).
- **TypeScript 6.0.x**
- **Bootstrap 5.3 & Bootstrap Icons 1.11**
- **RxJS 7.8**
- **Arquitectura Limpia**: `core/`, `shared/`, `layout/`, `features/`.

---

## 👥 Cuentas de Acceso y Matriz de Permisos (Semilla Backend)

| Usuario | Contraseña | Rol | Permisos Asignados |
| :--- | :--- | :--- | :--- |
| **`admin`** | `Auto2026*` | `ADMIN` | Acceso total a todos los módulos y operaciones. |
| **`asesor`** | `Auto2026*` | `ASESOR` | Registrar vehículos y órdenes, consultar catálogo de servicios y órdenes de servicio. |
| **`jefe`** | `Auto2026*` | `JEFE_TALLER` | Mantener catálogo de servicios, anular órdenes del día (RN-05) y ver reporte de ingresos. |
| **`inactivo`**| `Auto2026*` | `ASESOR` | Cuenta inactiva (Rechazado con 401 por el backend). |

---

## 🛠️ Instrucciones de Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   ng serve
   # o bien:
   npm start
   ```

3. **Abrir en el navegador:**
   - La aplicación estará disponible en: [http://localhost:4200](http://localhost:4200)
   - Conectará automáticamente al backend REST en: `http://localhost:8080/api/v1`

---

## 🛡️ Características de Seguridad y Arquitectura

- **Sesión con Expiración en `sessionStorage`:** Guarda token y tiempo de expiración (3600 segundos). Al vencer, cierra sesión automáticamente.
- **`jwtInterceptor`:** Inyecta la cabecera `Authorization: Bearer <token>` de forma centralizada únicamente en llamadas hacia la API.
- **`errorInterceptor`:**
  - Ante un `401 Unauthorized` (excepto login), destruye la sesión y redirige al login guardando el `returnUrl`.
  - Ante un `403 Forbidden`, no destruye la sesión y redirige a la pantalla `/acceso-denegado`.
- **Guards Standalone:**
  - `authGuard`: Protege el layout principal.
  - `invitadoGuard`: Evita acceder al login si ya existe sesión activa.
  - `permisoGuard`: Valida en tiempo de navegación los permisos declarados en `data: { permiso: '...' }`.
- **Directiva `*appSiPermiso`:** Oculta en tiempo real botones y opciones del menú sin recargar la página.

---

## 📋 Módulos y Reglas de Negocio Implementadas

1. **Catálogo de Servicios:**
   - Formulario reactivo único para registro (`/servicios/nuevo`) y edición (`/servicios/:id/editar`).
   - Validaciones: `SRV-000`, nombre (3-80 chars), precio (> 0), duración (15-480 min).
   - Toggle PATCH para activar/desactivar servicios (RN-01).
   - Manejo de error 409 al intentar eliminar un servicio con órdenes asociadas sin bloquear la pantalla.

2. **Control de Vehículos:**
   - Listado con visualización del nombre del cliente (sin exponer entidades anidadas).
   - Formulario con lista desplegable de clientes obtenida del backend (`GET /clientes`).
   - Validaciones: Placa `ABC-123`, año entre 1990 y 2027.
   - Manejo de error 409 en caso de placa duplicada (RN-02).

3. **Registro Cabecera-Detalle de Órdenes de Servicio:**
   - Formulario reactivo dinámico con `FormArray` para agregar y quitar líneas de detalle (1 a 10 líneas).
   - Control en tiempo real: impide seleccionar servicios repetidos o inactivos (RN-03).
   - Cantidades de 1 a 5. Cálculo reactivo de subtotales y total al instante.
   - En caso de error 409 (ej. kilometraje menor a la última orden según RN-04), la pantalla muestra el mensaje del backend **sin perder las líneas ingresadas**.

4. **Consulta y Anulación de Órdenes:**
   - Filtros combinables por placa, estado (`REGISTRADA`, `ANULADA`), fecha desde y hasta.
   - Modal para visualizar el detalle completo de líneas, precios y totales.
   - Modal de anulación (RN-05): exige motivo de 10 a 200 caracteres.

5. **Reporte de Ingresos por Servicio:**
   - Consume la consulta agregada JPQL del backend con filtro de rango de fechas y sumatorias globales.
