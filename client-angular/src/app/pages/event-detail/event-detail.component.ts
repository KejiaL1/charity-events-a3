import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { WeatherService, WeatherNow } from '../../services/weather.service';
import { HeroPipe } from '../../pipes/hero.pipe';
import { DateTimePipe } from '../../pipes/datetime.pipe';
import { PricePipe } from '../../pipes/price.pipe';
import { EndedPipe } from '../../pipes/ended.pipe';

import { RegistrationService, RegistrationItem } from '../../services/registration.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroPipe, DateTimePipe, PricePipe, EndedPipe],
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
  ev: any;
  loading = true;

  weather?: WeatherNow;
  weatherError = '';

  regs: RegistrationItem[] = [];
  regsLoading = false;
  totalRegs = 0;
  totalTickets = 0;

  constructor(
    private route: ActivatedRoute,
    private eventsApi: EventService,
    private weatherApi: WeatherService,
    private regsApi: RegistrationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventsApi.getEvent(id).subscribe({
      next: row => {
        this.ev = row;

        const lat = Number(row?.latitude);
        const lon = Number(row?.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          this.weatherApi.getNowByLatLon(lat, lon).subscribe({
            next: w => (this.weather = w),
            error: () => (this.weatherError = 'Weather unavailable')
          });
        }

        this.loadRegistrations(this.ev.id);
      },
      error: e => console.error(e),
      complete: () => (this.loading = false)
    });
  }

  private loadRegistrations(eventId: number) {
    this.regsLoading = true;
    this.regsApi.getByEvent(eventId).subscribe({
      next: list => {
        this.regs = list || [];
        this.totalRegs = this.regs.length;
        this.totalTickets = this.regs.reduce((sum, r) => sum + (Number(r.num_tickets) || 0), 0);
      },
      error: e => console.error('Failed to load registrations:', e),
      complete: () => (this.regsLoading = false)
    });
  }
}
