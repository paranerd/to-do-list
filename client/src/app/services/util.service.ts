import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  /**
   * Convert timestamp to datestring.
   *
   * @param {number} ts
   * @returns {string}
   */
  public static timestampToDate(ts: number): string {
    const date = new Date(ts);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`.slice(-2);
    const seconds = `0${date.getSeconds()}`.slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Capitalize string.
   *
   * @param {string} str
   * @returns {string}
   */
  public static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Returns connection status.
   *
   * @returns {boolean}
   */
  public static connectionStatus() {
    return merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      map((data) => {
        return data;
      })
    );
  }
}
