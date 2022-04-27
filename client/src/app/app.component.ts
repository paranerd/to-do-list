import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { PushService } from '@app/services/push.service';
import { UpdateService } from '@app/services/update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title: string = 'To-Do List';

  showSnackbar: boolean = false;

  snackbarActionName: string = 'Apply';

  snackbarMsg: string = 'Update available!';

  constructor(
    private push: PushService,
    public update: UpdateService,
    public router: Router
  ) {
    push.init();

    this.update.available.subscribe((available) => {
      // Show snackbar
      this.showSnackbar = available;
    });
  }
}
