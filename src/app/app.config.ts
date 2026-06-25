import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { StoreService } from './services/store.service';
import { provideClientHydration } from '@angular/platform-browser';

function initApp(auth: AuthService, store: StoreService, platformId: object) {
  if (!isPlatformBrowser(platformId)) return () => Promise.resolve();
  return () => Promise.all([auth.init(), store.init()]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AuthService, StoreService, PLATFORM_ID],
      multi: true,
    }, provideClientHydration(),
  ]
};
