import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app';

platformBrowserDynamic()
  .bootstrapModule(AppComponent)
  .catch((err: unknown) => console.error(err));
