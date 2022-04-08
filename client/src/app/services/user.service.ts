import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Settings } from '@app/models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  /**
   * Get user settings.
   *
   * @returns {Observable}
   */
  getSettings() {
    return this.http.get<any>(`${environment.apiUrl}/user/settings`, {}).pipe(
      map((data) => {
        return new Settings().deserialize(data);
      })
    );
  }
}
