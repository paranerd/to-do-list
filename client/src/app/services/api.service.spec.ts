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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should return items', () => {
    const mockItems = [];

    service.getItems({}).subscribe((items) => {
      expect(items.length).toBe(0);
      expect(items).toEqual(mockItems);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/item`);
    expect(req.request.method).toBe('GET');
    req.flush(mockItems);
  });
});
