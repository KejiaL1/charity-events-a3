// src/app/pipes/hero.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

const API_ORIGIN = 'http://localhost:3000';

@Pipe({ name: 'hero', standalone: true })
export class HeroPipe implements PipeTransform {
  transform(ev: any): string {
    const val = (ev?.hero_image_url ?? '').toString().trim();
    if (!val) return 'assets/img/placeholder-16x9.jpg';

    if (/^https?:\/\//i.test(val)) return val;

    if (/^\/?images\//i.test(val)) {
      const path = val.replace(/^\//, '');
      return `${API_ORIGIN}/${path}`;
    }

    if (/^\/?assets\//i.test(val)) {
      return val.replace(/^\//, '');
    }

    if (!val.includes('/')) {
      return `assets/img/${val}`;
    }

    if (val.startsWith('/')) {
      return `${API_ORIGIN}${val}`;
    }

    return `assets/img/${val}`;
  }
}
