import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Event } from '../../models/event.model';
import { Category } from '../../models/category.model';
import { EventService } from '../../services/event';
import { CategoryService } from '../../services/category';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css'
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  categories: Category[] = [];
  loading = false;
  
  filters = {
    date: '',
    city: '',
    categoryId: '',
    search: ''
  };

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    const cleanFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, value]) => value !== '')
    );

    this.eventService.getEvents(cleanFilters).subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
        alert('加载活动列表失败');
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
      }
    });
  }

  applyFilters(): void {
    this.loadEvents();
  }

  clearFilters(): void {
    this.filters = {
      date: '',
      city: '',
      categoryId: '',
      search: ''
    };
    this.loadEvents();
  }

  deleteEvent(eventId: number): void {
    if (confirm('确定要删除这个活动吗？此操作不可撤销。')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.events = this.events.filter(event => event.id !== eventId);
          alert('活动删除成功');
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