import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.html'
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  loading = false;
  eventId: number | null = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('EventFormComponent initialized');
    
    // 获取路由参数
    this.route.paramMap.subscribe(params => {
      this.eventId = Number(params.get('id'));
      this.isEditMode = !!this.eventId && this.router.url.includes('edit');
      
      console.log('Form mode:', this.isEditMode ? 'Edit' : 'Create', 'Event ID:', this.eventId);

      if (this.isEditMode && this.eventId) {
        this.loadEvent(this.eventId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      category_id: ['', Validators.required],
      org_id: ['', Validators.required],
      description: ['', Validators.required],
      purpose: [''],
      venue: [''],
      // 移除 city 和 state 字段，因为它们现在是固定的
      start_datetime: ['', Validators.required],
      end_datetime: ['', Validators.required],
      ticket_price_cents: [0, [Validators.min(0)]],
      is_free: [false],
      target_amount_cents: [0, [Validators.min(0)]],
      status: ['upcoming', Validators.required],
      hero_image_url: ['']
    });
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        console.log('Loaded event for editing:', event);
        const formattedEvent = {
          ...event,
          start_datetime: this.formatDateForInput(event.start_datetime),
          end_datetime: this.formatDateForInput(event.end_datetime)
        };
        this.eventForm.patchValue(formattedEvent);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.error = '加载活动数据失败';
        this.loading = false;
      }
    });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    console.log('Form submitted, valid:', this.eventForm.valid);
    
    if (this.eventForm.valid) {
      this.loading = true;
      this.error = '';
      
      const formValue = this.eventForm.value;
      console.log('Form data:', formValue);

      // 确保数字字段是数字类型
      const processedData = {
        ...formValue,
        ticket_price_cents: Number(formValue.ticket_price_cents) || 0,
        target_amount_cents: Number(formValue.target_amount_cents) || 0,
        // 确保布尔值是布尔类型
        is_free: Boolean(formValue.is_free)
      };

      if (this.isEditMode && this.eventId) {
        console.log('Updating event:', this.eventId);
        this.eventService.updateEvent(this.eventId, processedData).subscribe({
          next: () => {
            console.log('Event updated successfully');
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Update error:', error);
            this.error = '更新活动失败，请重试';
            this.loading = false;
          }
        });
      } else {
        console.log('Creating new event');
        this.eventService.createEvent(processedData).subscribe({
          next: () => {
            console.log('Event created successfully');
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Create error:', error);
            this.error = '创建活动失败，请重试';
            this.loading = false;
          }
        });
      }
    } else {
      console.log('Form is invalid');
      // 标记所有字段为 touched 以显示验证错误
      Object.keys(this.eventForm.controls).forEach(key => {
        const control = this.eventForm.get(key);
        control?.markAsTouched();
        console.log(`Field ${key}: valid=${control?.valid}, touched=${control?.touched}`);
      });
    }
  }

  cancel(): void {
    console.log('Form cancelled');
    this.router.navigate(['/events']);
  }
}