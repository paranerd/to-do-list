import { TestBed } from '@angular/core/testing';
import { ServiceWorkerModule } from '@angular/service-worker';

import { UpdateService } from './update.service';

describe('UpdateService', () => {
  let service: UpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateService],
      imports: [
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
      ],
    });
    service = TestBed.inject(UpdateService);
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });
});
