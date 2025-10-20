import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'events', renderMode: RenderMode.Prerender },

  { path: 'events/new', renderMode: RenderMode.Server },
  { path: 'events/:id', renderMode: RenderMode.Server },
  { path: 'events/:id/edit', renderMode: RenderMode.Server },

  { path: '**', renderMode: RenderMode.Server }
];
