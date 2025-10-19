import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { PricePipe } from '../../pipes/price.pipe';
import { DateTimePipe } from '../../pipes/datetime.pipe';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PricePipe, DateTimePipe],
  templateUrl: './search.component.html'
})
export class SearchComponent {
  categories: any[] = [];
  results: any[] = [];
  loading = false;

  date = '';
  city = '';
  categoryId = '';

  constructor(private eventsApi: EventService) {
    this.eventsApi.getCategories().subscribe({ next: rows => this.categories = rows });
  }

  search(): void {
    this.loading = true;
    this.eventsApi.getEvents({
      date: this.date,
      city: this.city,
      categoryId: this.categoryId
    }).subscribe({
      next: rows => this.results = rows,
      error: e => console.error(e),
      complete: () => this.loading = false
    });
  }

  reset(): void {
    this.date = '';
    this.city = '';
    this.categoryId = '';
    this.results = [];
  }
}
