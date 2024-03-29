import { Component } from '@angular/core';
import { Settings } from '@app/models/settings.model';
import { AuthService } from '@app/services/auth.service';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.scss'],
})
export class SettingsSecurityComponent {
  tfaCode: string;

  tfaSecret: string;

  error: string;

  settings: Settings = new Settings();

  constructor(public auth: AuthService, private userService: UserService) {
    this.getSettings();
  }

  /**
   * Get user settings.
   */
  getSettings() {
    this.userService.getSettings().subscribe((res) => {
      this.settings = res;
    });
  }

  /**
   * Toggle Two-factor Authentication.
   *
   * @param {boolean} enable
   */
  toggleTfa(enable) {
    if (enable) {
      this.auth.enableTfa().subscribe({
        next: (res) => {
          this.tfaCode = (res as any).image;
          this.tfaSecret = (res as any).secret;
        },
        error: (err) => {
          this.error = err;
        },
      });
    } else {
      this.auth.disableTfa().subscribe({
        error: (err) => {
          console.error('Error disabling Two-factor Authentication', err);
        },
      });
    }
  }

  /**
   * Confirm Two-factor Authentication with 6-digit code.
   *
   * @param {any} form
   */
  confirmTfa(form: any) {
    this.auth.confirmTfa(form.value.code).subscribe({
      complete: () => {
        this.tfaCode = '';
      },
      error: (err) => {
        this.error = err.message;
      },
    });
  }
}
