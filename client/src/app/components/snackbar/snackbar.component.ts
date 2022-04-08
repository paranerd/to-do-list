import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent {
  @Input() show: boolean = false;
  @Input() msg: string = '';
  @Input() actionName: string = 'Click';
  @Output() showChange = new EventEmitter<boolean>();
  @Output() action = new EventEmitter<boolean>();

  constructor() {}

  actionClicked() {
    this.action.emit(true);
  }

  hide() {
    this.show = false;
    this.showChange.emit(this.show);
  }
}
