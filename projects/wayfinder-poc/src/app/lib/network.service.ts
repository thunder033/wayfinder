import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Network } from '@wf-core/types/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  network$: Observable<Network> = of(null as any);

  constructor() { }
}
