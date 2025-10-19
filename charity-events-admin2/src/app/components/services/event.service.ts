import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { Event } from '../models/event';
import { Registration } from '../models/registration';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // 确保API地址正确 - 根据你的后端调整
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
    console.log('EventService initialized, API URL:', this.apiUrl);
  }

  getEvents(): Observable<any> {
    console.log('Fetching events from:', `${this.apiUrl}/events`);
    return this.http.get<any>(`${this.apiUrl}/events`).pipe(
      tap(response => console.log('Events API response:', response)),
      catchError(error => {
        console.error('Error fetching events:', error);
        throw error;
      })
    );
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`).pipe(
      tap(event => console.log('Event details:', event)),
      catchError(error => {
        console.error('Error fetching event:', error);
        throw error;
      })
    );
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    console.log('Creating event:', event);
    return this.http.post<Event>(`${this.apiUrl}/events`, event).pipe(
      tap(newEvent => console.log('Event created:', newEvent)),
      catchError(error => {
        console.error('Error creating event:', error);
        throw error;
      })
    );
  }

  updateEvent(id: number, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, event).pipe(
      catchError(error => {
        console.error('Error updating event:', error);
        throw error;
      })
    );
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting event:', error);
        throw error;
      })
    );
  }

  getEventRegistrations(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events/${eventId}/registrations`).pipe(
      catchError(error => {
        console.error('Error fetching registrations:', error);
        throw error;
      })
    );
  }
}