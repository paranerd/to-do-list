import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent {
  faSpinner = faSpinner;

  loading: boolean;

  error: string;

  password1: string;

  password2: string;

  constructor(
    public authService: AuthService,
    public router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle('Setup | To-Do List');
  }

  doSetup(form: any) {
    if (form.status === 'VALID') {
      this.loading = true;

      this.authService
        .setup(form.value.username, form.value.password1, form.value.password2)
        .subscribe({
          next: () => {
            this.error = '';
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.error = err;
            this.loading = false;

            // Clear passwords
            this.password1 = '';
            this.password2 = '';
          },
        });
    } else {
      if (!form.value.username) {
        this.error = 'Username must be provided';
      }
      if (!form.value.password1 || !form.value.password2) {
        this.error = 'Passwords must be provided';
      }
    }
  }
}
