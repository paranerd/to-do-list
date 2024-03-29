import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { faCloud } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '@app/services/auth.service';
import { UtilService } from '@app/services/util.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  faCloud = faCloud;

  online: boolean = true;

  menuOpen: boolean = false;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Escape' || event.code === 'Esc') {
      this.menuOpen = false;
    }
  }

  constructor(private router: Router, public auth: AuthService) {
    // Set online status
    this.online = navigator.onLine;

    // Listen for changes in online status
    UtilService.connectionStatus().subscribe((online) => {
      this.online = online;
    });
  }

  /**
   * Logout.
   */
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
