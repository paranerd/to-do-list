import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  faPlus,
  faEllipsisVertical,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Item } from '../../models/item.model';

import { ApiService } from '../../services/api.service';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  faPlus = faPlus;

  faEllipsisVertical = faEllipsisVertical;

  faXmark = faXmark;

  value: string = '';

  error: string = '';

  items: Array<Item> = [];

  paramSubscription: any;

  params: any = {};

  actionsOpen: boolean = false;

  showConfirmModal: boolean = false;

  confirmAction: any;

  confirmed: boolean = false;

  modalSuccess: string;

  modalError: string;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private titleService: Title,
    private api: ApiService,
    private history: HistoryService
  ) {
    this.titleService.setTitle('Home | To-Do List');
  }

  ngOnInit(): void {
    // Listen for parameter changes
    this.paramSubscription = this.route.queryParams.subscribe(async () => {
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
    this.api.getItems(this.params).subscribe({
      next: (items) => {
        this.items = items;
        this.items = HistoryService.rebuild(this.items);
      },
      error: (err) => {
        console.error('Error fetching items', err);
      },
    });
  }

  /**
   * Create item.
   *
   * @param {string} name
   * @param {number} pos
   */
  async createItem(name: string, pos: number = 0) {
    let item = new Item().deserialize({ name, pos });

    this.api.createItem(item).subscribe({
      next: (createdItem) => {
        // Try creating on the server
        item = createdItem;
      },
      error: () => {
        // Save creation for later instead
        item = HistoryService.create(item);
      },
      complete: () => {
        // Insert new item at pos
        this.items.splice(pos, 0, item);

        // Reset positions
        this.resetPositions();
      },
    });
  }

  /**
   * Update item.
   *
   * @param {Item} item
   * @param {Object} update
   * @param {FocusEvent} event
   */
  async updateItem(item: Item, update: Object = {}, event: FocusEvent = null) {
    // This prevents wrong double update on 'Enter'
    // which would cause keydown AND focusout to be triggered
    if (event && (event as any).sourceCapabilities === null) {
      return;
    }

    item.modified = Date.now();

    const updated = new Item().deserialize({ ...item, ...update });

    this.api.updateItem(updated).subscribe({
      error: (err) => {
        // Save the update for later
        HistoryService.update(updated);
        console.error('err', err);
      },
      complete: () => {
        // Update items array
        for (let i = 0; i < this.items.length; i += 1) {
          if (this.items[i].id === item.id) {
            this.items[i] = updated;
            break;
          }
        }

        // Reset positions
        this.resetPositions();
      },
    });
  }

  /**
   * Delete all checked items.
   */
  deleteDone(): void {
    const doneItems = this.items.filter((item) => item.done);

    // Check if there are items to be deleted
    if (doneItems.length === 0) {
      return;
    }

    if (!this.confirmed) {
      // Show confirmation dialog
      this.confirmAction = this.deleteDone;
      this.showConfirmModal = true;
      return;
    }

    // Close dropdown
    this.actionsOpen = false;

    // Delete items
    this.api.clearDoneItems().subscribe({
      next: () => {
        this.loadItems();
      },
      error: (err) => {
        console.error('error', err);
      },
    });

    // Reset confirmation
    this.confirmed = false;
  }

  /**
   * Delete all items.
   */
  deleteAll(): void {
    // Check if there are items to be deleted
    if (this.items.length === 0) {
      return;
    }

    if (!this.confirmed) {
      // Show confirmation dialog
      this.confirmAction = this.deleteAll;
      this.showConfirmModal = true;
      return;
    }

    // Close dropdown
    this.actionsOpen = false;

    // Delete items
    this.items.forEach((item) => {
      this.deleteItem(item);
    });

    // Reset confirmation
    this.confirmed = false;
  }

  /**
   * Delete item.
   *
   * @param {Item} item
   */
  async deleteItem(item: Item) {
    item.modified = Date.now();

    // Try deleting on the server
    this.api.deleteItem(item).subscribe({
      error: (err) => {
        // Save deletion for later instead
        HistoryService.delete(item);
        console.error('err', err);
      },
      complete: () => {
        // Update items array
        for (let i = 0; i < this.items.length; i += 1) {
          if (this.items[i].id === item.id) {
            this.items.splice(i, 1);
            break;
          }
        }

        // Reset positions
        this.resetPositions();
      },
    });
  }

  /**
   * Handle paste event.
   *
   * @param {Item} item
   * @param {event} event
   */
  async onPaste(item: Item, event: ClipboardEvent) {
    const target = <HTMLElement>event.target;

    // Get index of current item
    let index = item.pos + 1;

    // Get caret position
    const caretPos = HomeComponent.getCaretPosition(target);

    // Get text left of caret
    const leftOfCaret = target.innerText.substring(0, caretPos);

    // Get text right of caret
    const rightOfCaret = target.innerText.substring(caretPos);

    // Get pasted text
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const fullText = leftOfCaret + clipboardData.getData('text') + rightOfCaret;
    const lines = fullText.split('\n');

    const tasks = [];

    for (let i = 0; i < lines.length; i += 1) {
      if (i === 0) {
        // Update current item
        tasks.push(this.updateItem(item, { name: lines[i], pos: index - 1 }));
      } else {
        tasks.push(this.createItem(lines[i], index));
      }

      index += 1;
    }

    await Promise.all(tasks);
  }

  /**
   * Intercept keydown.
   *
   * @param {Item} item
   * @param {KeyboardEvent} event
   */
  async onKeydown(item: Item, event: KeyboardEvent) {
    if (event.code !== 'Enter') {
      return;
    }

    event.preventDefault();

    const target = <HTMLInputElement>event.target;

    // Get index of current item
    const index = item.pos + 1;

    // Get caret position
    const caretPos = target.selectionStart;

    // Determine name of current item
    const currentName = target.value.substring(0, caretPos).trim();

    // Determine name of new item
    const newName = target.value.substring(caretPos);

    // Update current item
    await this.updateItem(item, { name: currentName, pos: index - 1 });

    // Create new item
    await this.createItem(newName, index);

    // Focus on new item
    setTimeout(() => {
      (<HTMLElement>(
        document.querySelector(`.item:nth-child(${index + 1}) .item-name`)
      )).focus();
    }, 100);
  }

  /**
   * Set item positions
   * according to their position in the global array
   */
  resetPositions() {
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].pos = i;
    }
  }

  /**
   * Get caret position within editable HTML.
   *
   * @param {HTMLElement} elem
   * @returns {number}
   */
  static getCaretPosition(elem: HTMLElement) {
    if (window.getSelection) {
      const sel = window.getSelection();

      if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode === elem) {
          return range.endOffset;
        }
      }
    } else if (
      (document as any).selection &&
      (document as any).selection.createRange
    ) {
      const range = (document as any).selection.createRange();

      if (range.parentElement() === elem) {
        const tempEl = document.createElement('span');
        elem.insertBefore(tempEl, elem.firstChild);

        const tempRange = range.duplicate();
        tempRange.moveToElementText(tempEl);
        tempRange.setEndPoint('EndToEnd', range);

        return tempRange.text.length;
      }
    }

    return 0;
  }
}
