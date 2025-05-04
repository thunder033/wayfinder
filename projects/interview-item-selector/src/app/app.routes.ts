import { Route } from '@angular/router';

import { ItemSelectorComponent } from '../lib/components/item-selector/item-selector.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/item-selector', pathMatch: 'full' },
  { path: 'item-selector', component: ItemSelectorComponent },
];
