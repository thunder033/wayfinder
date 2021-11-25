import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Network } from '../../../../wayfinder-core/types/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  network$: Observable<Network> = of(null as Network);

  constructor() { }
}
