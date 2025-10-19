import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Event } from '../../models/event.model';
import { Category } from '../../models/category.model';
import { EventService } from '../../services/event';
import { CategoryService } from '../../services/category';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css'
})
export class EventFormComponent implements OnInit {
  event: Event = {
    title: '',
    description: '',
    city: '',
    state: '',
    start_datetime: '',
    end_datetime: '',
    category_id: 0,
    org_id: 0,
    hero_image_url: '',
    ticket_price_cents: 0,
    is_free: false
  };
  
  categories: Category[] = [];
  eventId: number | null = null;
  loading = false;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    
    this.eventId = this.route.snapshot.paramMap.get('id') ? 
      Number(this.route.snapshot.paramMap.get('id')) : null;
    
    if (this.eventId) {
      this.loadEvent();
    }
  }

  loadEvent(): void {
    if (!this.eventId) return;
    
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        alert('加载活动详情失败');
        this.router.navigate(['/events']);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        alert('加载类别列表失败');
      }
    });
  }

  onFreeChange(): void {
    if (this.event.is_free) {
      this.event.ticket_price_cents = 0;
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.loading = true;

    if (this.eventId) {
      this.updateEvent();
    } else {
      this.createEvent();
    }
  }

  createEvent(): void {
    this.eventService.createEvent(this.event).subscribe({
      next: (response) => {
        this.loading = false;
        alert('活动创建成功');
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating event:', error);
        alert('创建活动失败');
      }
    });
  }

  updateEvent(): void {
    if (!this.eventId) return;

    this.eventService.updateEvent(this.eventId, this.event).subscribe({
      next: (response) => {
        this.loading = false;
        alert('活动更新成功');
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error updating event:', error);
        alert('更新活动失败');
      }
    });
  }

  private isFormValid(): boolean {
    const requiredFields = [
      this.event.title,
      this.event.description,
      this.event.city,
      this.event.state,
      this.event.start_datetime,
      this.event.end_datetime,
      this.event.category_id,
      this.event.org_id
    ];

    return requiredFields.every(field => field && field.toString().trim() !== '');
  }
}
