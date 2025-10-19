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
        // 处理不同的响应格式
        this.events = response.events || response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = '加载活动列表失败,请检查网络连接或API服务';
        this.loading = false;
        this.events = []; // 清空列表
        
        // 如果是开发环境，显示模拟数据
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
        title: '示例活动 1',
        category_id: 1,
        org_id: 1,
        description: '这是一个示例活动',
        purpose: '慈善目的',
        venue: '示例场地',
        city: '北京',
        state: '北京',
        start_datetime: '2024-01-01T10:00:00',
        end_datetime: '2024-01-01T18:00:00',
        ticket_price_cents: 0,
        is_free: true,
        target_amount_cents: 0,
        raised_amount_cents: 0,
        status: 'upcoming',
        hero_image_url: '',
        category_name: '慈善活动',
        org_name: '示例组织'
      },
      {
        id: 2,
        title: '示例活动 2',
        category_id: 2,
        org_id: 2,
        description: '另一个示例活动',
        purpose: '筹集资金',
        venue: '另一个场地',
        city: '上海',
        state: '上海',
        start_datetime: '2024-01-02T10:00:00',
        end_datetime: '2024-01-02T18:00:00',
        ticket_price_cents: 1000,
        is_free: false,
        target_amount_cents: 100000,
        raised_amount_cents: 50000,
        status: 'upcoming',
        hero_image_url: '',
        category_name: '筹款活动',
        org_name: '另一个组织'
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
    if (confirm('确定要删除这个活动吗？此操作不可撤销。')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          console.log('Event deleted successfully');
          this.events = this.events.filter(event => event.id !== id);
        },
        error: (error) => {
          console.error('Delete error:', error);
          if (error.status === 409) {
            alert('无法删除活动：' + error.error.message);
          } else {
            alert('删除活动失败，请重试');
          }
        }
      });
    }
  }
}