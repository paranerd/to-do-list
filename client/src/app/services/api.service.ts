import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Item } from '../models/item.model';
import { ServiceToken } from '../models/service-token.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  public getItems(params: any): Promise<Array<Item>> {
    return new Promise((resolve, reject) => {
      this.httpClient.get(environment.apiUrl + '/item', {params: params})
      .subscribe((data: Array<Item>) => {
        data = data.map((itemData: any) => new Item().deserialize(itemData));
        resolve(data);
      }, (error: any) => {
        reject(error);
      });
    });
  }

  public createItem(item: Item): Promise<Item> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(environment.apiUrl + '/item', item)
      .subscribe((data: Item) => {
        resolve(data);
      }, (error: any) => {
        reject(error);
      });
    });
  }

  public updateItem(item: Item): Promise<Item> {
    return new Promise((resolve, reject) => {
      this.httpClient.patch(environment.apiUrl + '/item', item)
      .subscribe((data: Item) => {
        resolve(data);
      }, (error: any) => {
        reject(error);
      });
    });
  }

  public deleteItem(item: Item): Promise<Object> {
    const httpParams = new HttpParams({fromObject: {test: 'ting'}});
    return new Promise((resolve, reject) => {
      this.httpClient.request('delete', environment.apiUrl + '/item', {body: item})
      .subscribe(data => {
        resolve(data);
      }, (error: any) => {
        reject(error);
      });
    });
  }

  createServiceToken(name: string): Promise<ServiceToken> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(environment.apiUrl + '/service-token', {name})
      .subscribe((data: ServiceToken) => {
          resolve(data);
      }, (error: any) => {
          reject(error);
      });
    });
  }

  loadServiceTokens(): Promise<Array<ServiceToken>> {
    return new Promise((resolve, reject) => {
        this.httpClient.get(environment.apiUrl + '/service-token')
        .subscribe((data: Array<ServiceToken>) => {
            data = data.map((itemData: any) => new ServiceToken().deserialize(itemData));
            resolve(data);
        }, (error: any) => {
            reject(error);
        });
    });
  }

  deleteServiceToken(id: string) {
    return new Promise((resolve, reject) => {
        this.httpClient.delete(environment.apiUrl + '/service-token/' + id)
        .subscribe(data => {
            resolve(data);
        }, (error: any) => {
            reject(error);
        });
    });
  }
}
