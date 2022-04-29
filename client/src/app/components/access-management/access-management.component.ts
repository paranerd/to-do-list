import { Component, HostListener } from '@angular/core';
import { faKey, faTrashCan } from '@fortawesome/free-solid-svg-icons';

import { UtilService } from '@app/services/util.service';
import { ServiceToken } from '../../models/service-token.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-access-management',
  templateUrl: './access-management.component.html',
  styleUrls: ['./access-management.component.scss'],
})
export class AccessManagementComponent {
  timestampToDate = UtilService.timestampToDate;

  tokens: Array<ServiceToken> = [];

  showModal: boolean = false;

  modalTitle: string = 'Create Service Token';

  modalActionName: string = 'Create';

  modalFields: Array<string> = ['name'];

  modalSuccess: string = '';

  modalError: string = '';

  faKey = faKey;

  faTrashCan = faTrashCan;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Escape' || event.code === 'Esc') {
      this.showModal = false;
    }
  }

  constructor(private api: ApiService) {
    // Load service tokens
    this.loadTokens();
  }

  async createToken(name: string) {
    this.api.createServiceToken(name).subscribe({
      next: (token) => {
        this.modalSuccess = <string>token.token;
        this.modalError = '';

        this.loadTokens();
      },
      error: (err) => {
        console.error('Error creating token', err);
        this.modalError = <string>err;
      },
    });
  }

  async loadTokens() {
    this.api.loadServiceTokens().subscribe({
      next: (tokens) => {
        this.tokens = tokens;
      },
      error: (err) => {
        console.error('Error loading tokens', err);
      },
    });
  }

  async deleteToken(token: ServiceToken) {
    this.api.deleteServiceToken(token.id).subscribe({
      complete: () => {
        this.loadTokens();
      },
      error: (err) => {
        console.error('Error deleting token', err);
      },
    });
  }
}
