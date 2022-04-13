import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { ApiService } from './services/api.service';
import { HistoryService } from './services/history.service';
import { AuthService } from './services/auth.service';
import { UpdateService } from './services/update.service';

import { NavbarComponent } from './components/navbar/navbar.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SetupComponent } from './components/setup/setup.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoginComponent } from './components/login/login.component';
import { AccessManagementComponent } from './components/access-management/access-management.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { DonePipe } from './pipes/done.pipe';
import { UndonePipe } from './pipes/undone.pipe';
import { SettingsComponent } from './components/settings/settings.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SettingsSecurityComponent } from './components/settings-security/settings-security.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    SetupComponent,
    LoginComponent,
    AccessManagementComponent,
    DialogComponent,
    SnackbarComponent,
    DonePipe,
    UndonePipe,
    SettingsComponent,
    SettingsSecurityComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    FontAwesomeModule,
  ],
  providers: [
    Title,
    ApiService,
    HistoryService,
    AuthService,
    UpdateService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
