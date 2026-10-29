import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Permiso } from '../../core/auth/auth.models';

@Directive({
  selector: '[appSiPermiso]',
  standalone: true
})
export class SiPermisoDirective {
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private permisoRequerido?: Permiso | Permiso[];
  private tieneVista = false;

  constructor() {
    effect(() => {
      // Reacciona automáticamente a cambios en la lista de permisos del usuario (Signal)
      this.actualizarVista();
    });
  }

  @Input()
  set appSiPermiso(permiso: Permiso | Permiso[] | undefined) {
    this.permisoRequerido = permiso;
    this.actualizarVista();
  }

  private actualizarVista(): void {
    if (!this.permisoRequerido) {
      this.mostrar();
      return;
    }

    let concedido = false;
    if (Array.isArray(this.permisoRequerido)) {
      concedido = this.authService.tieneCualquiera(this.permisoRequerido);
    } else {
      concedido = this.authService.tienePermiso(this.permisoRequerido);
    }

    if (concedido && !this.tieneVista) {
      this.mostrar();
    } else if (!concedido && this.tieneVista) {
      this.ocultar();
    }
  }

  private mostrar(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.tieneVista = true;
  }

  private ocultar(): void {
    this.viewContainer.clear();
    this.tieneVista = false;
  }
}
