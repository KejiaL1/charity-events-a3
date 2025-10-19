import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { HeroPipe } from '../../pipes/hero.pipe';
import { DateTimePipe } from '../../pipes/datetime.pipe';
import { PricePipe } from '../../pipes/price.pipe';
import { EndedPipe } from '../../pipes/ended.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroPipe, DateTimePipe, PricePipe, EndedPipe],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  events: any[] = [];
  loading = true;

  constructor(private eventsApi: EventService) {}

  ngOnInit(): void {
    this.eventsApi.getEvents().subscribe({
      next: rows => this.events = rows,
      error: e => console.error(e),
      complete: () => this.loading = false
    });
  }
}
