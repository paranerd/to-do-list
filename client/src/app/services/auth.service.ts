import { Injectable } from '@angular/core';
import { User } from '@app/models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  currentUser: User;

  constructor(private http: HttpClient, public router: Router) {
    this.currentUser = JSON.parse(localStorage.getItem('user'));
  }

  // Setup
  setup(username: string, password1: string, password2: string) {
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

  // Register
  register(firstName: string, email: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/register`, { firstName, email })
      .pipe(
        map((data) => {
          console.log(data);
          //localStorage.setItem('user', JSON.stringify(user));
          //this.currentUser = user;
        })
      );
  }

  // Login
  login(username: string, password: string, tfa: string = null) {
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

  // Set password
  setPassword(email, token, password1, password2) {
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

  // Set password
  resetPassword(token, password1, password2) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/reset-password`, {
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

  // Set password
  forgotPassword(email) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/forgot-password`, { email })
      .pipe(
        map((data) => {
          console.log(data);
        })
      );
  }

  // Get current user
  getCurrentUser(): User {
    return this.currentUser;
  }

  // Check if logged in
  get isLoggedIn(): boolean {
    return localStorage.getItem('user') !== null;
  }

  // Logout
  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  enableTfa() {
    return this.http
      .post<any>(`${environment.apiUrl}/user/enable-tfa`, {})
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  disableTfa() {
    return this.http
      .post<any>(`${environment.apiUrl}/user/disable-tfa`, {})
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  confirmTfa(code) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/confirm-tfa`, { code })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
}
