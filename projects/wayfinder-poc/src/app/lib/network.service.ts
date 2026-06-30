import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Network } from 'wf-core';

// need to remember what this service was for or delete it
@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  network$: Observable<Network> = of(null as any);

  constructor() {}
}
