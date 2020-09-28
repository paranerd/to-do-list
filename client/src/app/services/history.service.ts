import { Injectable } from '@angular/core';

import { ApiService } from '../services/api.service';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})

export class HistoryService {
  constructor(private api: ApiService) {

  }

    /**
     * Create item in localStorage
     * @param {Item} item
     */
    create(item: Item) {  
      item.action = 'create';

      // Update history
      let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
      history.unshift(item);
      localStorage.setItem('history', JSON.stringify(history));
  
      return item;
  }

  /**
   * Add updated item to localStorage
   * @param {Item} item
   * @param {Object} update
   */
  update(item: Item) {
    // Apply update
    item.action = 'update';

      // Update history
      let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
      history.unshift(item);
      localStorage.setItem('history', JSON.stringify(history));

      return item;
  }

  /**
   * Save item for deletion in localStorage
   * @param {Item} item
   * @returns {Item}
   */
  delete(item: Item) {
    item.action = 'delete';

    // Update history
      let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
      history.unshift(item);
      localStorage.setItem('history', JSON.stringify(history));

      return item;
  }

  /**
   * Sync all pending updates from localStorage to server
   */
  async sync() {
      let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

      for (let i = history.length - 1; i >= 0; i--) {
          const item = history[i];

          switch (item.action) {
              case 'create':
                  try {
                      await this.api.createItem(item);
                      history.splice(i, 1);
                      localStorage.setItem('history', history);
                  } catch (err) {
                      console.error(err);
                  }
                  break;
              case 'update':
                  try {
                      await this.api.updateItem(item);
                      history.splice(i, 1);
                      localStorage.setItem('history', history);
                  } catch (err) {
                      console.error(err);
                  }
                  break;
              case 'delete':
                  try {
                      await this.api.deleteItem(item);
                      history.splice(i, 1);
                      localStorage.setItem('history', history);
                  } catch (err) {
                      console.error(err);
                  }
                  break;
          }
      }
  }

  rebuild(items: Array<Item>) {
      const history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
  
      for (let i = history.length - 1; i >= 0; i--) {
          const item = history[i];

          switch (item.action) {
              case 'create':
                  if (item.pos) {
                      // Insert new item at index
                      items.splice(item.pos, 0, item);
                  }
                  else {
                      // Insert new item at the end
                      items.push(item);
                  }
  
                  break;
  
              case 'update':
                  // Update items array
                  for (let i = 0; i < items.length; i++) {
                      if (items[i].id === item.id) {
                          delete item.action;
  
                          if (item.pos != items[i].pos) {
                              // We can't use the old pos as reference for splicing
                              // as it doesn't get updated on create/delete (only on server)
                              items.splice(i, 1);
                              items.splice(item.pos, 0, item);
                          }
                          else {
                              items[i] = item;
                          }
  
                          break;
                      }
                  }
  
                  break;
  
              case 'delete':
                  // Update items array
                  for (let i = 0; i < items.length; i++) {
                      if (items[i].id === item.id) {
                          items.splice(i, 1);
                          break;
                      }
                  }
  
                  break;
          }
      }
  
      return items;
  }
}
