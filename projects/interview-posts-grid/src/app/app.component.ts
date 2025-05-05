import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';

import { itemSelector } from '../lib/state';
import { GetItemsResponse } from '../lib/types/items';
import { cacheValue } from 'wf-core';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'interview-posts-grid';

  constructor(private store: Store, private http: HttpClient) {
    this.store.pipe(tapLog('state'), cacheValue()).subscribe();
    this.loadItemsData();
  }

  loadItemsData() {
    const itemsEndpoint = '/get-items.json';
    this.http
      .get<GetItemsResponse>(itemsEndpoint)
      .pipe()
      .subscribe((data) => {
        data.folders.data.forEach((rawFolder) =>
          this.store.dispatch(itemSelector.loadFolder({ rawFolder })),
        );
        data.items.data.forEach((rawItem) =>
          this.store.dispatch(itemSelector.loadItem({ rawItem })),
        );
      });
  }
}
