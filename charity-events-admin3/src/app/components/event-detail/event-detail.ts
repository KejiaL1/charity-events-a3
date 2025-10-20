import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/event';
import { Registration } from '../models/registration';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.html'
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  registrations: Registration[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadEvent();
  }

  loadEvent(): void {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.eventService.getEvent(id).subscribe({
        next: (event) => {
          this.event = event;
          this.loadRegistrations(id);
        },
        error: (error) => {
          this.error = 'Failed to load event details';
          this.loading = false;
          console.error('Error loading event:', error);
        }
      });
    }
  }

  loadRegistrations(eventId: number): void {
    this.eventService.getEventRegistrations(eventId).subscribe({
      next: (response) => {
        this.registrations = response.registrations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading registrations:', error);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  editEvent(): void {
    if (this.event) {
      this.router.navigate(['/events', this.event.id, 'edit']);
    }
  }

  deleteEvent(): void {
    if (this.event && confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.router.navigate(['/events']);
        },
        error: (error) => {
          if (error.status === 409) {
            alert('Cannot delete event: ' + error.error.message);
          } else {
            alert('Failed to delete event');
          }
          console.error('Error deleting event:', error);
        }
      });
    }
  }
}