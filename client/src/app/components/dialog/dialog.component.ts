import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UtilService } from '@app/services/util.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  @Input() title: string = 'Dialog';

  @Input() show: boolean = false;

  @Input() fields: Array<string> = [];

  @Input() error: string = '';

  @Input() success: string = '';

  @Input() actionName: string = 'Send';

  @Input() autoHide: boolean = false;

  @Output() showChange = new EventEmitter<boolean>();

  @Output() action = new EventEmitter<Object>();

  copyTooltipText: string = 'Copy';

  constructor(private util: UtilService) {}

  onSubmit(form: any) {
    this.action.emit(form.value);

    if (this.autoHide) {
      this.hide();
    }
  }

  hide() {
    this.show = false;
    this.showChange.emit(this.show);
  }

  copyText(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.copyTooltipText = 'Copied!';

    setTimeout(() => {
      this.copyTooltipText = 'Copy';
    }, 5000);
  }
}
