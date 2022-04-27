import { Injectable } from '@angular/core';
import { User } from '@app/models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  currentUser: User;

  constructor(private http: HttpClient, public router: Router) {
    this.currentUser = JSON.parse(localStorage.getItem('user'));
  }

  /**
   * Setup.
   *
   * @param {string} username
   * @param {string} password1
   * @param {string} password2
   * @returns {Observable<void>}
   */
  setup(
    username: string,
    password1: string,
    password2: string
  ): Observable<void> {
    return this.http
      .post<any>(`${environment.apiUrl}/user/setup`, {
        username,
        password1,
        password2,
      })
      .pipe(
        map((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser = user;
        })
      );
  }

  /**
   * Login.
   *
   * @param {string} username
   * @param {string} password
   * @param {string} tfa
   * @returns {Observable<void>}
   */
  login(
    username: string,
    password: string,
    tfa: string = null
  ): Observable<void> {
    return this.http
      .post<any>(`${environment.apiUrl}/user/login`, {
        username,
        password,
        tfa,
      })
      .pipe(
        map((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser = user;
        })
      );
  }

  /**
   * Set password.
   *
   * @param {string} email
   * @param {string} token
   * @param {string} password1
   * @param {string} password2
   * @returns {Observable<void>}
   */
  setPassword(email, token, password1, password2): Observable<void> {
    return this.http
      .post<any>(`${environment.apiUrl}/user/set-password`, {
        email,
        token,
        password1,
        password2,
      })
      .pipe(
        map((data) => {
          console.log(data);
        })
      );
  }

  /**
   * Get current user.
   *
   * @returns {User}
   */
  getCurrentUser(): User {
    return this.currentUser;
  }

  /**
   * Check if logged in.
   *
   * @returns {boolean}
   */
  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Logout.
   */
  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  /**
   * Enable Two-Factor Authentication.
   *
   * @returns {Observable<void>}
   */
  enableTfa(): Observable<void> {
    return this.http
      .post<any>(`${environment.apiUrl}/user/enable-tfa`, {})
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  /**
   * Disable Two-Factor Authentication.
   *
   * @returns {Observable<void>}
   */
  disableTfa(): Observable<void> {
    return this.http
      .post<any>(`${environment.apiUrl}/user/disable-tfa`, {})
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  /**
   * Confirm Two-Factor Authentication.
   *
   * @param {string} code
   * @returns {Observable<void>}
   */
  confirmTfa(code): Observable<void> {
    return this.http
      .post<any>(`${environment.apiUrl}/user/confirm-tfa`, { code })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
}
