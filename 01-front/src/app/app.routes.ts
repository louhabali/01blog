import { Routes } from '@angular/router';
import { PresentationComponent } from './pages/presntation/presntation.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', component: PresentationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
