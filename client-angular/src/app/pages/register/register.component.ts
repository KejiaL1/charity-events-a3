import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { DateTimePipe } from '../../pipes/datetime.pipe';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DateTimePipe, PricePipe],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  ev: any;
  loading = true;

  form = { user_name: '', contact_email: '', num_tickets: 1, notes: '' };
  submitting = false;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private events: EventService,
    private regs: RegistrationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.events.getEvent(id).subscribe({
      next: row => this.ev = row,
      complete: () => this.loading = false
    });
  }

  submit(): void {
    this.error = ''; this.success = false;
    if (!this.ev?.id) { this.error = 'Invalid event'; return; }
    if (!this.form.user_name || !this.form.contact_email) {
      this.error = 'Please fill your name and email.'; return;
    }
    this.submitting = true;
    this.regs.create({
      event_id: this.ev.id,
      user_name: this.form.user_name,
      contact_email: this.form.contact_email,
      num_tickets: Number(this.form.num_tickets || 1),
      notes: this.form.notes || undefined
    }).subscribe({
      next: () => { this.success = true; this.form = { user_name:'', contact_email:'', num_tickets:1, notes:''}; },
      error: e => this.error = e?.error?.message || 'Submit failed',
      complete: () => this.submitting = false
    });
  }
}
