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
    
    // Get route parameters
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
      // Remove city and state fields as they are now fixed
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
        this.error = 'Failed to load event data';
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

      // Ensure numeric fields are number type
      const processedData = {
        ...formValue,
        ticket_price_cents: Number(formValue.ticket_price_cents) || 0,
        target_amount_cents: Number(formValue.target_amount_cents) || 0,
        // Ensure boolean is boolean type
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
            this.error = 'Failed to update event, please try again';
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
            this.error = 'Failed to create event, please try again';
            this.loading = false;
          }
        });
      }
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors
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