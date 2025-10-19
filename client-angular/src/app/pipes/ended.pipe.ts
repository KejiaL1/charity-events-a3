import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isEnded', standalone: true })
export class EndedPipe implements PipeTransform {
  transform(end?: string | Date | null): boolean {
    if (!end) return false;
    const t = new Date(end).getTime();
    return isNaN(t) ? false : (t < Date.now());
  }
}
