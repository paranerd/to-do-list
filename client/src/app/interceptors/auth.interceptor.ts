import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { AuthService } from '@app/services/auth.service';

import { environment } from '@environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Send token if user is logged in and request is to API endpoint
    if (this.authService.isLoggedIn && req.url.startsWith(environment.apiUrl)) {
      // eslint-disable-next-line no-param-reassign
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.getCurrentUser().token}`,
        },
      });
    }

    return next.handle(req);
  }
}
