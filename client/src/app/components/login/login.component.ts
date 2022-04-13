import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '@app/services/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  faSpinner = faSpinner;
  loading: boolean;
  error: string;
  waitForTfa: boolean = false;

  @ViewChild('login', { static: true }) loginForm: NgForm;
  @ViewChild('tfa', { static: true }) tfaForm: NgForm;

  constructor(
    public authService: AuthService,
    public router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle('Login | To-Do List');
  }

  /**
   * Perform login.
   *
   * @param {any} form
   */
  doLogin(form: any) {
    if (form.status === 'VALID') {
      this.loading = true;

      this.authService
        .login(
          this.loginForm.value.username,
          this.loginForm.value.password,
          this.tfaForm.value.tfa
        )
        .subscribe({
          next: (data) => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            if (err.message === 'TFA required') {
              this.waitForTfa = true;
            } else {
              this.error = err;
            }

            this.loading = false;
          },
        });
    }
  }
}
