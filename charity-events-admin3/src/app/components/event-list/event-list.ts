import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/event';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-list.html'
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  error = '';

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('EventListComponent initialized');
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    
    this.eventService.getEvents().subscribe({
      next: (response) => {
        console.log('Events loaded successfully:', response);
        // Handle different response formats
        this.events = response.events || response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Failed to load event list. Please check network connection or API service';
        this.loading = false;
        this.events = []; // Clear the list
        
        // Show mock data if in development environment
        if (this.isDevelopment()) {
          this.showMockData();
        }
      }
    });
  }

  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  private showMockData(): void {
    console.log('Showing mock data for development');
    this.events = [
      {
        id: 1,
        title: 'Sample Event 1',
        category_id: 1,
        org_id: 1,
        description: 'This is a sample event',
        purpose: 'Charitable Purpose',
        venue: 'Sample Venue',
        city: 'Beijing',
        state: 'Beijing',
        start_datetime: '2024-01-01T10:00:00',
        end_datetime: '2024-01-01T18:00:00',
        ticket_price_cents: 0,
        is_free: true,
        target_amount_cents: 0,
        raised_amount_cents: 0,
        status: 'upcoming',
        hero_image_url: '',
        latitude: -33.8688,      // Add latitude and longitude
        longitude: 151.2093,     // Add latitude and longitude
        category_name: 'Charity Event',
        org_name: 'Sample Organization'
      },
      {
        id: 2,
        title: 'Sample Event 2',
        category_id: 2,
        org_id: 2,
        description: 'Another sample event',
        purpose: 'Fundraising',
        venue: 'Another Venue',
        city: 'Shanghai',
        state: 'Shanghai',
        start_datetime: '2024-01-02T10:00:00',
        end_datetime: '2024-01-02T18:00:00',
        ticket_price_cents: 1000,
        is_free: false,
        target_amount_cents: 100000,
        raised_amount_cents: 50000,
        status: 'upcoming',
        hero_image_url: '',
        latitude: -33.8688,      // Add latitude and longitude
        longitude: 151.2093,     // Add latitude and longitude
        category_name: 'Fundraising Event',
        org_name: 'Another Organization'
      }
    ];
    this.loading = false;
  }

  viewEvent(id: number): void {
    console.log('Viewing event:', id);
    this.router.navigate(['/events', id]);
  }

  editEvent(id: number): void {
    console.log('Editing event:', id);
    this.router.navigate(['/events', id, 'edit']);
  }

  deleteEvent(id: number): void {
    console.log('Attempting to delete event:', id);
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          console.log('Event deleted successfully');
          this.events = this.events.filter(event => event.id !== id);
        },
        error: (error) => {
          console.error('Delete error:', error);
          if (error.status === 409) {
            alert('Unable to delete event: ' + error.error.message);
          } else {
            alert('Failed to delete event. Please try again');
          }
        }
      });
    }
  }
}