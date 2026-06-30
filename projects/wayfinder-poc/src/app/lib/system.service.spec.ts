import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { network, region } from 'wf-core';

import { SystemService } from './system.service';

describe('SystemService', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
    });
    const service = TestBed.inject(SystemService);
    return { service };
  };

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });
});
