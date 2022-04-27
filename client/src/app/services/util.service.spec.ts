import { TestBed } from '@angular/core/testing';

import { UtilService } from './util.service';

describe('UtilService', () => {
  let service: UtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilService);
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should capitalize', () => {
    const capitalized = UtilService.capitalize('capitalized');
    expect(capitalized).toEqual('Capitalized');
  });

  it('Should return correct datestring', () => {
    const datestring = UtilService.timestampToDate(1651085740000);
    expect(datestring).toEqual('2022-04-27 20:55:40');
  });
});
