import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SetupComponent } from './setup/setup.component';
import { LoginComponent } from './login/login.component';
import { AccessManagementComponent } from './access-management/access-management.component';

import { AuthGuard } from "./services/auth.guard";

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'setup',
        component: SetupComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'access-management',
        component: AccessManagementComponent,
        data: {
            role: 'admin'
        }
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})

export class AppRoutingModule { }
