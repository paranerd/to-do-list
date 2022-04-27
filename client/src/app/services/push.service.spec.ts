import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@environments/environment';

import { PushService } from './push.service';

describe('PushService', () => {
  let service: PushService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: environment.production,
        }),
        RouterTestingModule,
      ],
    });
    service = TestBed.inject(PushService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
