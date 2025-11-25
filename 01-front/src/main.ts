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
import { withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './app/interceptor';
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withFetch(), 
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
