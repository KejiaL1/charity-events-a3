// src/app/services/registration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RegistrationItem {
  id: number;
  event_id: number;
  user_name: string;
  contact_email: string;
  num_tickets: number;
  registration_date: string;
  notes?: string;
}

const API_BASE = (environment as any)?.apiBase || 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  /** 提交报名 */
  create(payload: {
    event_id: number;
    user_name: string;
    contact_email: string;
    num_tickets: number;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${API_BASE}/registrations`, payload);
  }

  getByEvent(eventId: number): Observable<RegistrationItem[]> {
    const params = new HttpParams().set('event_id', String(eventId));

    return this.http
      .get<any>(`${API_BASE}/registrations`, { params })
      .pipe(
        map(resp => {
          let list: RegistrationItem[] = [];
          if (Array.isArray(resp)) {
            list = resp as RegistrationItem[];
          } else if (resp && Array.isArray(resp.registrations)) {
            list = resp.registrations as RegistrationItem[];
          }
          return list.filter(r => Number(r.event_id) === Number(eventId));
        })
      );
  }
}
