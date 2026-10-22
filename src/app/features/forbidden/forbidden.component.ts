import { Component } from '@angular/core';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center gap-2">
      <h1 class="text-3xl font-bold">403 — Acceso denegado</h1>
      <p class="text-slate-600">No tienes permisos para esta sección.</p>
    </div>
  `,
})
export class ForbiddenComponent {}