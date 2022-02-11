import { Component, OnInit, HostListener } from '@angular/core';
import { Title } from "@angular/platform-browser";

import { ServiceToken } from '../models/service-token.model';
import { ApiService } from '../services/api.service';
import { UtilService } from '../services/util.service';

@Component({
    selector: 'app-access-management',
    templateUrl: './access-management.component.html',
    styleUrls: ['./access-management.component.scss']
})

export class AccessManagementComponent implements OnInit {
    tokens: Array<ServiceToken> = [];
    showModal: boolean = false;
    modalTitle: string = 'Create Service Token';
    modalActionName: string = 'Create';
    modalFields: Array<string> = ['name'];
    modalSuccess: string = '';
    modalError: string = '';

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.code == 'Escape' || event.code == 'Esc') {
            this.showModal = false;
        }
    }

    constructor(private titleService: Title, private api: ApiService, private util: UtilService) {
        this.titleService.setTitle("Access Management | To-Do List");

        // Load service tokens
        this.loadTokens();
    }

    ngOnInit(): void {
    }

    async createToken(name: string) {
        try {
            const token = await this.api.createServiceToken(name);
            this.modalSuccess = <string>token.token;

            this.loadTokens();
      } catch (err) {
          console.log("Error creating token", err);
          this.modalError = <string>err;
      }
    }

    async loadTokens() {
        try {
            this.tokens = await this.api.loadServiceTokens();
        } catch (err) {
            console.log("Error loading tokens", err);
        }
    }

    async deleteToken(token: ServiceToken) {
        try {
            await this.api.deleteServiceToken(token.id);

            this.loadTokens();
        } catch (err) {
            console.log("Error deleting token", err);
        }
    }
}
