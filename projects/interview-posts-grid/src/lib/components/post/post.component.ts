import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { filter, map, share } from 'rxjs';

import { postsGrid } from '../../state';
import { AppState, Post } from '../../types/posts-grid';

type PostProp = keyof Post;
const POST_PROPS: PostProp[] = ['title', 'userId', 'id', 'body'];
const INITIAL_PROP_INDEX = 0;

@Component({
  selector: 'app-post',
  imports: [CommonModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.focused]': 'post().isFocused',
    '[id]': '`app-post-${id()}`',
  },
})
export class PostComponent implements OnInit {
  id = input.required<number>();
  post = computed(() => this.store.selectSignal(postsGrid.selectPost(this.id()))());

  displayPropIndex = signal<number>(INITIAL_PROP_INDEX);
  displayProp = computed(() => this.post()[POST_PROPS[this.displayPropIndex()]]);

  onUnfocus$ = toObservable(this.post).pipe(
    map((post) => post.isFocused),
    filter((isFocused) => !isFocused),
    share(),
  );

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // I looked at doing this with a computed signal instead, but for now it felt messier/less intuitive
    this.onUnfocus$.subscribe(() => this.displayPropIndex.set(INITIAL_PROP_INDEX));
  }

  @HostListener('click', ['$event'])
  toggleDisplayProp() {
    if (!this.post().isFocused) {
      this.store.dispatch(postsGrid.focusPost({ id: this.id() }));
    }

    this.displayPropIndex.set((this.displayPropIndex() + 1) % POST_PROPS.length);
  }
}
