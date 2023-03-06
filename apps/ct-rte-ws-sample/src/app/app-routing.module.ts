import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ErrorComponent } from './pages/error/error.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { EventsAllComponent } from './pages/events/events.all.component';
import { EventsCreateComponent } from './pages/events/events.create.component';
import { EventsModifiedComponent } from './pages/events/events.modified.component';
import { EventsModifiedFilterComponent } from './pages/events/events.modified.filter.component';

const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'events-all',
    component: EventsAllComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'events-create',
    component: EventsCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'events-modified',
    component: EventsModifiedComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'events-modified-filter',
    component: EventsModifiedFilterComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
