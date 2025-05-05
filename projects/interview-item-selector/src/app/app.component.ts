import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';

import { itemSelector } from '../lib/state';
import { GetItemsResponse } from '../lib/types/items';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'interview-item-selector';

  constructor(private store: Store, private http: HttpClient) {
    this.loadItemsData();
  }

  // in a production app this would go into some kind of service based on architecture needs
  loadItemsData() {
    const itemsEndpoint = '/get-items.json';
    this.http.get<GetItemsResponse>(itemsEndpoint).subscribe((data) => {
      data.folders.data.forEach((rawFolder) =>
        this.store.dispatch(itemSelector.loadFolder({ rawFolder })),
      );
      data.items.data.forEach((rawItem) => this.store.dispatch(itemSelector.loadItem({ rawItem })));
    });
  }
}
