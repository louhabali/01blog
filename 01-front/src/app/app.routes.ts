  import { Routes } from '@angular/router';
  import { PresntationComponent } from './pages/presntation/presntation.component';
  import { LoginComponent } from './pages/login/login.component';
  import { RegisterComponent } from './pages/register/register.component';
  import { ProfileComponent } from './pages/profile/profile.component';
  import { HomeComponent } from './pages/home/home.component';
  import { CommentsComponent } from './pages/comments/comments.component';
  import { PostdetailsComponent } from './pages/postdetails/postdetails.component';
  import { LoggedInGuard } from './services/loggedIn.guard';
  import { AuthGuard } from './services/auth.guard';
  import { NotificationsComponent } from './pages/notifications/notifications.component';
  import { AdmindashboardComponent } from './pages/admindashboard/admindashboard.component';
  import { AdminGuard } from './services/admin.guard';
  import { NotFoundComponent } from './pages/not-found/not-found.component';
  export const routes: Routes = [

    { path: '', component: PresntationComponent },
    { path: 'login', component: LoginComponent,canActivate:[LoggedInGuard] },
    { path: 'register', component: RegisterComponent,canActivate:[LoggedInGuard] },
    { path: 'home', component: HomeComponent },
    { path: 'posts/:id',component:PostdetailsComponent},
    { path: 'posts/:id/comments',component:CommentsComponent},
    { path: 'profile/:id', component: ProfileComponent },
    { path: 'notifications', component: NotificationsComponent,canActivate:[AuthGuard] },
    { path: 'dashboard', component: AdmindashboardComponent,canActivate:[AdminGuard] },


    
    { path: '**', component: NotFoundComponent},
    
  ];
