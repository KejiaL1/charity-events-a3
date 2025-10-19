import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <a class="brand" routerLink="/">Charity Events</a>
      <a routerLink="/" routerLinkActive="active">Home</a>
      <a routerLink="/search" routerLinkActive="active">Search</a>
    </nav>
  `
})
export class NavbarComponent {}
