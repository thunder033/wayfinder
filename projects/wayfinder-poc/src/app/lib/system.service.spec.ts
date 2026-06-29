import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { network, region } from 'wf-core';

import { SystemService } from './system.service';

describe('SystemService', () => {
  let service: SystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
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
