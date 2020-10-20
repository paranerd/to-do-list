import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/item.model';

@Pipe({
  name: 'undone',
  pure: false
})
export class UndonePipe implements PipeTransform {

  transform(value: Array<Item>, ...args: unknown[]): unknown {
    return value.filter(item => !item.done);
  }

}
