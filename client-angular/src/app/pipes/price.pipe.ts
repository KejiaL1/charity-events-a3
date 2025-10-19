import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'price', standalone: true })
export class PricePipe implements PipeTransform {
  transform(cents?: number | null, isFree?: number | boolean): string {
    if (isFree || !cents || Number(cents) === 0) return 'Free';
    return '$' + (Number(cents) / 100).toFixed(2);
  }
}
