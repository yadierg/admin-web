import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private readonly store = inject(AuthStore);

  ngOnInit(): void {
    this.store.hydrateFromStorage();
  }
}