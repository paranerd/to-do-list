import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';

import { UtilService } from '../services/util.service';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})

export class DialogComponent implements OnInit {
    @Input() title: string = "Dialog";
    @Input() show: boolean = false;
    @Input() fields: Array<string> = [];
    @Input() error: string = "";
    @Input() success: string = "";
    @Input() actionName: string = "Send";
    @Output() showChange = new EventEmitter<boolean>();
    @Output() action = new EventEmitter<Object>();
    copyTooltipText: string = "Copy";

    constructor(private util: UtilService) {}

    ngOnInit(): void {}

    onSubmit(form: any) {
        this.action.emit(form.value);
    }

    hide() {
        this.show = false;
        this.showChange.emit(this.show);
    }

    copyText(val: string){
        let selBox = document.createElement('textarea');
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

        this.copyTooltipText = "Copied!";

        setTimeout(() => {
          this.copyTooltipText = "Copy";
        }, 5000);
    }
}
