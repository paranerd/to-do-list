import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { environment } from '@environments/environment';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should return items', () => {
    const mockItems = [
      {
        id: '123',
        name: 'test',
        done: false,
      },
    ];

    service.getItems({}).subscribe((items) => {
      expect(items.length).toBe(1);
      expect(items[0].pos).toEqual(0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/item`);
    expect(req.request.method).toBe('GET');
    req.flush(mockItems);
  });
});
