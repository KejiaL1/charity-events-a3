import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { Event } from '../models/event';
import { Registration } from '../models/registration';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'https://24516675.it.scu.edu.au/api';

  private readonly defaultCoordinates = {
    latitude: -33.8688,
    longitude: 151.2093
  };

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

  createEvent(eventData: Partial<Event>): Observable<Event> {
    const eventWithDefaults = {
      ...eventData,
      city: 'Sydney',
      state: 'NSW',
      latitude: this.defaultCoordinates.latitude,
      longitude: this.defaultCoordinates.longitude,
      raised_amount_cents: 0,
      hero_image_url: eventData.hero_image_url || 'assets/img/default_event.jpg'
    };

    console.log('Creating event with data:', eventWithDefaults);
    return this.http.post<Event>(`${this.apiUrl}/events`, eventWithDefaults).pipe(
      tap(newEvent => console.log('Event created:', newEvent)),
      catchError(error => {
        console.error('Error creating event:', error);
        throw error;
      })
    );
  }

  updateEvent(id: number, eventData: Partial<Event>): Observable<Event> {
    console.log('Updating event:', id, 'with data:', eventData);
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, eventData).pipe(
      tap(updatedEvent => console.log('Event updated:', updatedEvent)),
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