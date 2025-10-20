import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
  <nav class="nav">
    <a class="nav-link" routerLink="/" routerLinkActive="active" aria-label="Home">
      <span class="icon" aria-hidden="true">
        <!-- Home icon -->
        <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
          <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"></path>
        </svg>
      </span>
      <span>Home</span>
    </a>
    <a class="nav-link" routerLink="/search" routerLinkActive="active" aria-label="Search">
      <span class="icon" aria-hidden="true">
        <!-- Search icon -->
        <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM5 9.5C5 7.01 7.01 5 9.5 5S14 7.01 14 9.5 11.99 14 9.5 14 5 11.99 5 9.5z"></path>
        </svg>
      </span>
      <span>Search</span>
    </a>
  </nav>
  `
})
export class NavbarComponent {}
