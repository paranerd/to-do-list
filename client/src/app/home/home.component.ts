import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from "@angular/platform-browser";

import { Item } from '../models/item.model';

import { ApiService } from '../services/api.service';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  value:string = "";
  error:string = "";
  items:Array<Item> = [];
  paramSubscription: any;
  params:any = {};

  constructor(private route: ActivatedRoute, public router: Router, private titleService: Title, private api: ApiService, private history: HistoryService) {
    this.titleService.setTitle("Home | To-Do List");
  }

  ngOnInit(): void {
    // Listen for parameter changes
    this.paramSubscription = this.route.queryParams.subscribe(async queryParams => {
      // Reset error
      this.error = null;

      // Reset items
      this.items = [];

      // Sync history
      await this.history.sync();

      // Load items
      this.loadItems();
    });
  }

  ngOnDestroy() {
    // Remove parameter change subscription
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }

  /**
   * Load items
   */
  async loadItems() {
    try {
      this.items = await this.api.getItems(this.params);
      this.items = this.history.rebuild(this.items);
    } catch (err) {
      console.log("Error fetching items", err);
    }

    /*this.api.getItemsRxJs(this.params).subscribe(items => {
      console.log("rxjs items", items);
      this.items = items;
    });*/
  }

  /**
  * Create item
  * 
  * @param {string} name
  * @param {number} pos
  */
  async createItem(name: string, pos: number = 0) {
    let item = new Item().deserialize({name, pos});

    try {
      // Try creating on the server
      item = await this.api.createItem(item)
    } catch (err) {
      // Save creation for later instead
      item = this.history.create(item);
    } finally {
      // Insert new item at pos
      this.items.splice(pos, 0, item);

      // Reset positions
      this.resetPositions();
    }
  }

  /**
   * Update item
   * 
   * @param {item} item
   * @param {Object} update
   */
  async updateItem(item: Item, update: Object = {}) {
    Object.assign(item, update);
    item.modified = Date.now();

    try {
      // Try updating on the server
      item = await this.api.updateItem(item);
    } catch (err) {
      // Save the update for later instead
      item = this.history.update(item);
    } finally {
      // Update items array
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === item.id) {
          this.items[i] = item;
          break;
        }
      }

      // Reset positions
      this.resetPositions();
    }
  }

  /**
   * Delete item
   * 
   * @param {item} item
   */
  async deleteItem(item: Item) {
    item.modified = Date.now();

    try {
      // Try deleting on the server
      await this.api.deleteItem(item);
    } catch (err) {
      // Save deletion for later instead
      item = this.history.delete(item);
      console.log("err", err);
    } finally {
      // Update items array
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === item.id) {
          this.items.splice(i, 1);
          break;
        }
      }
  
      // Reset positions
      this.resetPositions();
    }
  }

  /**
   * Catch paste event
   * 
   * @param {Item} item
   * @param {event} event
   */
  async onPaste(item: Item, event: ClipboardEvent) {
    const target = <HTMLElement>event.target

    // Get index of current item
    let index = item.pos + 1;

    // Get caret position
    const caretPos = this.getCaretPosition(target);

    // Get text left of caret
    const leftOfCaret = target.innerText.substring(0, caretPos);

    // Get text right of caret
    const rightOfCaret = target.innerText.substring(caretPos);

    // Get pasted text
    const clipboardData = event.clipboardData || window['clipboardData'];
    const fullText = leftOfCaret + clipboardData.getData('text') + rightOfCaret
    const lines = fullText.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (i === 0) {
        // Update current item
        await this.updateItem(item, {name: lines[i], pos: index - 1});
      }
      else {
        await this.createItem(lines[i], index);
      }

      index++;
    }
  }

  /**
   * Intercept keydown
   * 
   * @param {Item} item
   * @param {KeyboardEvent} event
   */
  async onKeydown(item: Item, event: KeyboardEvent) {
    if (event.which !== 13) {
      return;
    }

    event.preventDefault();

    const target = <HTMLElement>event.target;

    // Get index of current item
    const index = item.pos + 1;

    // Get caret position
    const caretPos = this.getCaretPosition(target);

    // Determine name of current item
    const currentName = target.innerText.substring(0, caretPos).trim();

    // Determine name of new item
    const newName = target.innerText.substring(caretPos);

    // Update current item
    await this.updateItem(item, {name: currentName, pos: index - 1});

    // Create new item
    await this.createItem(newName, index);

    // Focus on new item
    setTimeout(() => {
      (<HTMLElement>document.querySelector('.item:nth-child(' + (index + 1) + ') [contenteditable]')).focus();
    }, 10);
  }

  /**
   * Set item positions
   * according to their position in the global array
   */
  resetPositions() {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].pos = i;
    }
  }

  /**
   * Get caret position within editable HTML
   * 
   * @param {HTMLElement} elem
   * @returns {number}
   */
  getCaretPosition(elem: HTMLElement) {
    if (window.getSelection) {
      const sel = window.getSelection();

      if (sel.rangeCount) {
        let range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode == elem) {
          return range.endOffset;
        }
      }
    }
    else if (document['selection'] && document['selection'].createRange) {
      const range = document['selection'].createRange();

      if (range.parentElement() == elem) {
        const tempEl = document.createElement("span");
        elem.insertBefore(tempEl, elem.firstChild);
      
        const tempRange = range.duplicate();
        tempRange.moveToElementText(tempEl);
        tempRange.setEndPoint("EndToEnd", range);
        
        return tempRange.text.length;
      }
    }

    return 0;
  }
}
