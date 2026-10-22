import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-semibold">Admin Instelec</h1>
      <router-outlet />
    </div>
  `,
})
export class MainLayoutComponent {}