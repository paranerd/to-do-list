import { Item } from '@app/models/item.model';
import { UndonePipe } from './undone.pipe';

describe('UndonePipe', () => {
  it('Should create an instance', () => {
    const pipe = new UndonePipe();
    expect(pipe).toBeTruthy();
  });

  it('Should filter done items correctly', () => {
    const pipe = new UndonePipe();

    const items: Item[] = [
      {
        id: 1,
        done: true,
      },
      {
        id: 2,
        done: false,
      },
    ].map((item) => {
      return new Item().deserialize(item);
    });

    const transformed = pipe.transform(items);

    expect(transformed.length).toBe(1);
  });
});
