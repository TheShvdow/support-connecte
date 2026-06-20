import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { StoreService } from './services/store.service';

function initApp(auth: AuthService, store: StoreService) {
  return () => Promise.all([auth.init(), store.init()]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AuthService, StoreService],
      multi: true,
    },
  ]
};
