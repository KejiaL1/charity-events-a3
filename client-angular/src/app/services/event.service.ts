import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private http: HttpClient) {}

  getEvents(filters?: { date?: string; city?: string; location?: string; categoryId?: number | string; search?: string }): Observable<any[]> {
    let params = new HttpParams();
    const f = filters || {};
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<any[]>(`${API_BASE}/events`, { params });
  }

  getEvent(id: number): Observable<any> {
    return this.http.get<any>(`${API_BASE}/events/${id}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/categories`);
  }
}
