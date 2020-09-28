import { Component, OnInit } from '@angular/core';

import { PushService } from '@app/services/push.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title: string = 'To-Do List';

    constructor(private push: PushService) {
        push.init();
    }

    ngOnInit(): void {
    }
}
