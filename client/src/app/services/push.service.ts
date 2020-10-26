import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';

import { AuthService } from '@app/services/auth.service';

import { environment } from '@environments/environment';

@Injectable({
    providedIn: 'root'
})

export class PushService {
    notificationPermission: NotificationPermission | null = null;

    constructor(private httpClient: HttpClient, private swPush: SwPush, public auth: AuthService) { }

    /**
     * Set up subscriptions
     */
    async init() {
        // Check if logged in
        if (!this.auth.getCurrentUser()) {
            return;
        }

        // Check if already subscribed
        if (localStorage.getItem('subscribed')) {
            return;
        }

        // Get notification permission
        this.notificationPermission = this.swPush.isEnabled ? Notification.permission : null;

        // Get VAPID public key
        const publicKey = await this.getPublicKey();

        if (!publicKey) {
            console.error("[Push] Error", "No vapid key");
            return;
        }

        try {
            // Get subscription object
            const subscription = await this.swPush.requestSubscription({serverPublicKey: publicKey});
            this.notificationPermission = Notification.permission;

            // Send subscription to server
            this.subscribe(subscription);

            // Register notification click handler
            this.swPush.notificationClicks.subscribe(event => {
                this.handleNotificationClick(event)
            });
        } catch (err) {
            console.error("Error subscribing", err);
        }
    }

    /**
     * Handle notification clicks
     * 
     * @param event
     */
    private handleNotificationClick(event) {
        const url = event.notification.data.url;
        window.open(url, '_blank');
    }

    /**
     * Get VAPID public key from server
     */
    private getPublicKey(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(environment.apiUrl + '/subscription/vapid')
            .subscribe((data: Object) => {
                resolve(data['pubKey']);
            }, (err: any) => {
                console.error("Error obtaining public key", err);
                resolve("");
            });
        });
    }

    /**
     * Send subscription object to server
     * 
     * @param params
     */
    private subscribe(params: PushSubscriptionJSON) {
        this.httpClient.post(environment.apiUrl + "/subscription", params)
        .subscribe(data => {
            localStorage.setItem('subscribed', "true");
        });
    }
}
