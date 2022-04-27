import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { ServiceToken } from '../models/service-token.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  public getItems(params: any): Observable<Array<Item>> {
    return this.httpClient.get(`${environment.apiUrl}/item`, { params }).pipe(
      map((data: Array<Item>) => {
        return data.map((itemData: any) => new Item().deserialize(itemData));
      })
    );
  }

  public createItem(item: Item): Observable<Item> {
    return this.httpClient.post(`${environment.apiUrl}/item`, item).pipe(
      map((data: Item) => {
        return new Item().deserialize(data);
      })
    );
  }

  public updateItem(item: Item): Observable<Item> {
    return this.httpClient.patch(`${environment.apiUrl}/item`, item).pipe(
      map((data: Item) => {
        return new Item().deserialize(data);
      })
    );
  }

  public deleteItem(item: Item): Observable<Object> {
    return this.httpClient.request('delete', `${environment.apiUrl}/item`, {
      body: item,
    });
  }

  createServiceToken(name: string): Observable<ServiceToken> {
    return this.httpClient
      .post(`${environment.apiUrl}/service-token`, { name })
      .pipe(
        map((data: ServiceToken) => {
          return new ServiceToken().deserialize(data);
        })
      );
  }

  loadServiceTokens(): Observable<Array<ServiceToken>> {
    return this.httpClient.get(`${environment.apiUrl}/service-token`).pipe(
      map((data: Array<ServiceToken>) => {
        return data.map((tokenData: any) =>
          new ServiceToken().deserialize(tokenData)
        );
      })
    );
  }

  deleteServiceToken(id: string): Observable<Object> {
    return this.httpClient.delete(`${environment.apiUrl}/service-token/${id}`);
  }
}
