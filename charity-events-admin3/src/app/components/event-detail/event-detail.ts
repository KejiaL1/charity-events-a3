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
          this.error = '加载活动详情失败';
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
    if (this.event && confirm('确定要删除这个活动吗？此操作不可撤销。')) {
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.router.navigate(['/events']);
        },
        error: (error) => {
          if (error.status === 409) {
            alert('无法删除活动：' + error.error.message);
          } else {
            alert('删除活动失败');
          }
          console.error('Error deleting event:', error);
        }
      });
    }
  }
}