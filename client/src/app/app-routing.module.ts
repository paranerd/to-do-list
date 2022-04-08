import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SetupComponent } from './components/setup/setup.component';
import { LoginComponent } from './components/login/login.component';
import { AccessManagementComponent } from './components/access-management/access-management.component';

import { AuthGuard } from './services/auth.guard';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'setup',
    component: SetupComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'access-management',
    component: AccessManagementComponent,
    data: {
      role: 'admin',
    },
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
