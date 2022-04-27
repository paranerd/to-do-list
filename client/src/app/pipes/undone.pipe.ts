/* eslint-disable class-methods-use-this */
import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/item.model';

@Pipe({
  name: 'undone',
  pure: false,
})
export class UndonePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: Array<Item>, ...args: unknown[]): Item[] {
    return value.filter((item) => !item.done);
  }
}
