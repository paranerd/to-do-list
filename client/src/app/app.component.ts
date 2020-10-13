import { Component, OnInit } from '@angular/core';

import { PushService } from '@app/services/push.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title: string = 'To-Do List';
    showSnackbar: boolean = false;
    snackbarActionName: string = "";
    snackbarMsg: string = "";

    constructor(private push: PushService, private swUpdate: SwUpdate) {
        push.init();

        this.swUpdate.available.subscribe(e => {
            // Show snackbar
            this.snackbarMsg = "Update available!";
            this.snackbarActionName = "Apply";
            this.showSnackbar = true;
        });
    }

    ngOnInit(): void {
    }

    applyUpdate() {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
    }
}
