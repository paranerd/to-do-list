import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable()
export class UpdateService {
  available: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private appRef: ApplicationRef, private updates: SwUpdate) {
    const appIsStable = appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    const everyTwelveHours = interval(1000 * 60 * 60 * 12);
    const appIsStableAndDelayHasPassed = concat(appIsStable, everyTwelveHours);

    // Search for update
    this.updates.available.subscribe((e) => {
      this.available.next(true);
      this.apply();
    });

    // Search for update periodically
    appIsStableAndDelayHasPassed.subscribe(() => {
      updates.checkForUpdate();
    });
  }

  apply() {
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}
