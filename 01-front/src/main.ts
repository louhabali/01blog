import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient,withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { importProvidersFrom } from '@angular/core';
import { withXsrfConfiguration ,withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './app/interceptor';
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withFetch(), // <-- This is CRITICAL for sending cookies
      withXsrfConfiguration({ // <-- This is your CSRF config
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([
        credentialsInterceptor
      ])
    ), 
    provideRouter(routes),
     importProvidersFrom(
      MatToolbarModule,
      MatIconModule,
      MatButtonModule,
      MatMenuModule
    )
  ]
});
