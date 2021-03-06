import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from "@angular/platform-browser";

import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
    loading: boolean;
    error: string;

    constructor(public authService: AuthService, public router: Router, private titleService: Title) {
        this.titleService.setTitle("Login | To-Do List");
    }
    
    ngOnInit(): void {}

    doLogin(form: any) {
        if (form.status === 'VALID') {
          this.loading = true;
          this.authService.login(form.value.username, form.value.password).subscribe(
            data => {
                this.router.navigate(['/']);
            },
            error => {
              console.error("Error: ", error);
              this.error = error;
              this.loading = false;
            }
          );
        }
        else {
          console.error("Invalid form");
        }
    }
}
