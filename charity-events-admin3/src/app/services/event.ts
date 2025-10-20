import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs';
import { Event, EventRegistration } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'https://24516675.it.scu.edu.au/api';

  constructor(private http: HttpClient) { }

  getEvents(filters?: any): Observable<Event[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/events`, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res?.events ?? []))
    );
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }

  createRegistration(registration: EventRegistration): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.apiUrl}/registrations`, registration);
  }
}