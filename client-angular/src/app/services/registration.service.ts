import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  create(payload: { event_id: number; user_name: string; contact_email: string; num_tickets: number; notes?: string }): Observable<any> {
    return this.http.post(`${API_BASE}/registrations`, payload);
  }
}
