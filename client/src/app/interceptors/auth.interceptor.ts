import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { AuthService } from '@app/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  refreshing: boolean = false;

  constructor(private authService: AuthService, public router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Add token to header if user is logged in and request is to API endpoint
    if (this.authService.isLoggedIn && req.url.startsWith(environment.apiUrl)) {
      // eslint-disable-next-line no-param-reassign
      req = this.addTokenHeader(req);
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log('Error intercepted', err);
        console.log('environment.apiUrl', environment.apiUrl);
        const errorText = err.error?.msg || err.statusText;

        if (err.status === 401) {
          console.log('Status is 401');
        }

        if (err.url.startsWith(environment.apiUrl)) {
          console.log('URL startsWith');
        }

        if (!err.url.endsWith('/login')) {
          console.log('URL does not start with /login');
        }

        if (!errorText.includes('TFA')) {
          console.log('Error text does not include TFA');
        }

        if (
          err.status === 401 &&
          err.url.startsWith(environment.apiUrl) &&
          !err.url.endsWith('/login') &&
          !errorText.includes('TFA')
        ) {
          if (!this.refreshing) {
            console.log('Access token expired. Trying to refresh...');
            // Try to refresh token
            this.refreshing = true;

            return this.authService.refresh().pipe(
              switchMap(() => {
                this.refreshing = false;
                // Retry same request with updated token
                return next.handle(this.addTokenHeader(req));
              }),
              catchError((refreshErr) => {
                const refreshErrorText =
                  refreshErr.error?.msg || refreshErr.statusText;
                this.refreshing = false;

                // Auto logout if 401 response returned from API
                this.authService.logout();
                this.router.navigate(['/login']);

                return throwError(() => new Error(refreshErrorText));
              })
            );
          }
          console.log('Access token expired but not trying to refresh.');

          // Auto logout if 401 response returned from API
          this.refreshing = false;
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        return throwError(() => new Error(errorText));
      })
    );
  }

  /**
   * Add auth token to request header.
   *
   * @param {HttpRequest<any>} req
   * @returns {HttpRequest<any>}
   */
  addTokenHeader(req) {
    const path = req.url.replace(environment.apiUrl, '');
    const token = ['/auth/refresh', '/auth/logout'].includes(path)
      ? this.authService.getCurrentUser().refreshToken
      : this.authService.getCurrentUser().token;

    // eslint-disable-next-line no-param-reassign
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
