import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { postsGrid } from '../../state';
import { AppState } from '../../types/posts-grid';
import { PostComponent } from '../post/post.component';

@Component({
  selector: 'app-posts-grid',
  imports: [CommonModule, PostComponent],
  templateUrl: './posts-grid.component.html',
  styleUrl: './posts-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsGridComponent {
  posts = this.store.selectSignal(postsGrid.selectPostsList);
  focusedPostId = this.store.selectSignal(postsGrid.selectFocusedPostId);

  constructor(private store: Store<AppState>) {}
}
