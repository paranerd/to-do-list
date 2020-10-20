import * as uuid from 'uuid';

export class Item {
    id: string;
    name: string;
    created: number;
    modified: number;
    done: boolean;
    pos: number;
    action?: string;

    deserialize(input: any): Item {
        Object.assign(this, input);

        this.id = this.id || uuid.v4();
        this.created = this.created || Date.now();
        this.modified = this.modified || Date.now();
        this.done = this.done || false;
        this.pos = this.pos !== null ? this.pos : 0;

        return this;
    }
}
