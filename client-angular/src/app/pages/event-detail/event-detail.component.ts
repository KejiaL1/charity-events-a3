import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { HeroPipe } from '../../pipes/hero.pipe';
import { DateTimePipe } from '../../pipes/datetime.pipe';
import { PricePipe } from '../../pipes/price.pipe';
import { EndedPipe } from '../../pipes/ended.pipe';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroPipe, DateTimePipe, PricePipe, EndedPipe],
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
  ev: any;
  loading = true;

  constructor(private route: ActivatedRoute, private eventsApi: EventService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventsApi.getEvent(id).subscribe({
      next: row => this.ev = row,
      error: e => console.error(e),
      complete: () => this.loading = false
    });
  }
}
