import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { network, region } from 'wf-core';

import { SystemService } from './system.service';

describe('SystemService', () => {
  let service: SystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
    });
    service = TestBed.inject(SystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
