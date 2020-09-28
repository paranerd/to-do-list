import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@app/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
      public authService: AuthService,
      public router: Router
    ) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const role = next.data.role;
        if (this.authService.isLoggedIn) {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }

    getCookie(cookieName){
        const name = cookieName + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(";");
    
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1)
            }
      
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length)
            }
        }
    
        return ""
    }

    cookieExists(cookieName) {
        return document.cookie.match(new RegExp("(?:^| )" + cookieName + "=([^;]+)")) !== null;
    }
}
