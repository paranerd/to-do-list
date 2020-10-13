import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-snackbar',
    templateUrl: './snackbar.component.html',
    styleUrls: ['./snackbar.component.scss']
})

export class SnackbarComponent implements OnInit {
    @Input() show: boolean = false;
    @Input() msg: string = "";
    @Input() actionName: string = "Click";
    @Output() showChange = new EventEmitter<boolean>();
    @Output() action = new EventEmitter<boolean>();

    constructor() {}

    ngOnInit(): void {}

    actionClicked() {
        this.action.emit(true);
    }

    hide() {
        this.show = false;
        this.showChange.emit(this.show);
    }
}
