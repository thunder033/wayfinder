import { Route } from '@angular/router';

import { PostsGridComponent } from '../lib/components/posts-grid/posts-grid.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/posts-grid', pathMatch: 'full' },
  { path: 'posts-grid', component: PostsGridComponent },
];
