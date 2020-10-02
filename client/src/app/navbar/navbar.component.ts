import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@app/services/auth.service';
import { UtilService } from '@app/services/util.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    online: boolean = true;
    menuOpen: boolean = false;

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.code == 'Escape' || event.code == 'Esc') {
            this.menuOpen = false;
        }
    }

    constructor(private router: Router, public auth: AuthService, private util: UtilService) {
        // Set online status
        this.online = navigator.onLine;

        // Listen for changes in online status
        util.connectionStatus().subscribe(online => {
            this.online = online;
        });
    }

    ngOnInit(): void {
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }
}
