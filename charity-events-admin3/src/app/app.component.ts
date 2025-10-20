import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav';  // 修正路径

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent],  // 确保这是数组
  template: `
    <app-nav></app-nav>
    <div class="container-fluid">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'charity-events-admin';
}