import { Injectable } from '@angular/core';

import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(private api: ApiService) {}

  /**
   * Create item in localStorage.
   *
   * @param {Item} item
   */
  static create(item: Item) {
    item.action = 'create';

    // Update history
    const history = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : [];
    history.unshift(item);
    localStorage.setItem('history', JSON.stringify(history));

    return item;
  }

  /**
   * Add updated item to localStorage.
   *
   * @param {Item} item
   * @param {Object} update
   */
  static update(item: Item) {
    // Apply update
    item.action = 'update';

    // Update history
    const history = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : [];
    history.unshift(item);
    localStorage.setItem('history', JSON.stringify(history));

    return item;
  }

  /**
   * Save item for deletion in localStorage.
   *
   * @param {Item} item
   * @returns {Item}
   */
  static delete(item: Item) {
    item.action = 'delete';

    // Update history
    const history = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : [];
    history.unshift(item);
    localStorage.setItem('history', JSON.stringify(history));

    return item;
  }

  /**
   * Sync all pending updates from localStorage to server.
   */
  async sync() {
    const history = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : [];

    /* eslint-disable no-await-in-loop */
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const item = history[i];

      if (item.action === 'create') {
        try {
          await firstValueFrom(this.api.createItem(item));
          history.splice(i, 1);
          localStorage.setItem('history', history);
        } catch (err) {
          console.error(err);
        }
      } else if (item.action === 'update') {
        try {
          await firstValueFrom(this.api.updateItem(item));
          history.splice(i, 1);
          localStorage.setItem('history', history);
        } catch (err) {
          console.error(err);
        }
      } else if (item.action === 'delete') {
        try {
          await firstValueFrom(this.api.deleteItem(item));
          history.splice(i, 1);
          localStorage.setItem('history', history);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  static rebuild(items: Array<Item>) {
    const history = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : [];

    for (let i = history.length - 1; i >= 0; i -= 1) {
      const item = history[i];

      if (item.action === 'create') {
        if (item.pos) {
          // Insert new item at index
          items.splice(item.pos, 0, item);
        } else {
          // Insert new item at the end
          items.push(item);
        }
      } else if (item.action === 'update') {
        // Update items array
        for (let j = 0; j < items.length; j += 1) {
          if (items[j].id === item.id) {
            delete item.action;

            if (item.pos !== items[j].pos) {
              // We can't use the old pos as reference for splicing
              // as it doesn't get updated on create/delete (only on server)
              items.splice(j, 1);
              items.splice(item.pos, 0, item);
            } else {
              items[j] = item;
            }

            break;
          }
        }
      } else if (item.action === 'delete') {
        // Update items array
        for (let j = 0; j < items.length; j += 1) {
          if (items[j].id === item.id) {
            items.splice(j, 1);
            break;
          }
        }
      }
    }

    return items;
  }
}
