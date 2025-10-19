import { Routes } from '@angular/router';
import { EventListComponent } from './components/event-list/event-list';
import { EventFormComponent } from './components/event-form/event-form';
import { EventDetailComponent } from './components/event-detail/event-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/events', pathMatch: 'full' },
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/edit/:id', component: EventFormComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: '**', redirectTo: '/events' }
];
