import { Routes } from '@angular/router';
import { PresntationComponent } from './pages/presntation/presntation.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HomeComponent } from './pages/home/home.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { LoggedInGuard } from './services/loggedIn.guard';
import { AuthGuard } from './services/auth.guard';
export const routes: Routes = [
  { path: '', component: PresntationComponent },
  { path: 'login', component: LoginComponent,canActivate:[LoggedInGuard] },
  { path: 'register', component: RegisterComponent,canActivate:[LoggedInGuard] },
  { path: 'home', component: HomeComponent,canActivate:[AuthGuard] },
  { path: 'posts/:id/comments',component:CommentsComponent,canActivate:[AuthGuard]},
  { path: 'profile/:id', component: ProfileComponent,canActivate:[AuthGuard] },
];
