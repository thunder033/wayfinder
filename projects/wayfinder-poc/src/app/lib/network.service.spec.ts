import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { network, region } from 'wf-core';

import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
    });
    service = TestBed.inject(NetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
