import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = false;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEvent();
  }

  loadEvent(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!eventId || isNaN(eventId)) {
      this.router.navigate(['/events']);
      return;
    }

    this.loading = true;
    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.loading = false;
        if (error.status === 404) {
          this.event = null;
        } else {
          alert('加载活动详情失败');
          this.router.navigate(['/events']);
        }
      }
    });
  }

  deleteEvent(): void {
    if (!this.event?.id) return;

    if (confirm('确定要删除这个活动吗？此操作不可撤销。')) {
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          alert('活动删除成功');
          this.router.navigate(['/events']);
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          if (error.status === 400) {
            alert('无法删除活动：该活动已有注册记录');
          } else {
            alert('删除活动失败');
          }
        }
      });
    }
  }
}
