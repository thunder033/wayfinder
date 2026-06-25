import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { network, region } from 'wf-core';

import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
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
