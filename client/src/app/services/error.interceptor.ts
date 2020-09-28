import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { AuthService } from "@app/services/auth.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, public router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401 && err.url.startsWith(environment.apiUrl)) {
                // Auto logout if 401 response returned from API
                this.authService.logout();
                //location.reload(true);
                this.router.navigate(['/login']);
            }

            console.log("Auth error", err);

            const error = err.error.msg || err.statusText;
            return throwError(error);
        }))
    }
}