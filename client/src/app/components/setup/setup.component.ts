import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent {
  loading: boolean;
  error: string;

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
      console.log(form);
      this.authService
        .setup(form.value.username, form.value.password1, form.value.password2)
        .subscribe(
          (data) => {
            this.router.navigate(['/']);
          },
          (error) => {
            console.log('Error: ' + error);
            this.error = error;
            this.loading = false;
          }
        );
    } else {
      console.log('Invalid form');
    }
  }
}
