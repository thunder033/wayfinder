import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Network } from 'wf-core';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  network$: Observable<Network> = of(null as any);

  constructor() {}
}
