import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { select, Store } from '@ngrx/store';
import { combineLatest, filter, switchMap, take } from 'rxjs';

import { itemSelector } from '../../state';
import { AppState } from '../../types/items';
import { ItemComponent } from '../item/item.component';

@Component({
  selector: 'app-folder',
  imports: [CommonModule, ItemComponent],
  templateUrl: './folder.component.html',
  styleUrl: './folder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--level]': 'this.level()',
  },
})
export class FolderComponent {
  // I find components that take as little input data as possible to be the most adaptable
  // and to lead to the best long term architecture outcomes. When a component takes a whole
  // data structure as input, it's not very "standalone" and often leads to a lot of duplicated
  // logic around the app
  id = input.required<number>();
  level = input(1);

  expanded = signal(true);

  // worked out this selectSignal pattern near the end of development, would have to investigate
  // guidelines for when to use selectSignal over RxJS. Generally the simplicity of "just use RxJS"
  // is attractive over multiple async abstractions with lots of complex rules
  folder = computed(() => this.store.selectSignal(itemSelector.selectFolder(this.id()))());

  id$ = toObservable(this.id).pipe(filter((id): id is number => !!id));

  childFolders$ = this.id$.pipe(
    switchMap((id) => this.store.pipe(select(itemSelector.selectChildFolders(id)))),
  );

  childItems$ = this.id$.pipe(
    switchMap((id) => this.store.pipe(select(itemSelector.selectChildItems(id)))),
  );

  anyItemsChecked$ = this.id$.pipe(
    switchMap((id) =>
      this.store.pipe(
        select(itemSelector.selectFolderHasAnyCheckedItems(id)),
        tapLog('any checked ID' + id + ';'),
      ),
    ),
  );

  allItemsChecked$ = this.id$.pipe(
    switchMap((id) =>
      this.store.pipe(
        select(itemSelector.selectFolderHasAllCheckedItems(id)),
        tapLog('all checked ID' + id + ';'),
      ),
    ),
  );

  constructor(private store: Store<AppState>) {}

  toggleFolderChecked() {
    combineLatest({ id: this.id$, allItemsChecked: this.allItemsChecked$ })
      .pipe(take(1))
      .subscribe(({ id, allItemsChecked }) => {
        this.store.dispatch(
          allItemsChecked ? itemSelector.uncheckFolder({ id }) : itemSelector.checkFolder({ id }),
        );
      });
  }

  toggleFolderExpanded() {
    this.expanded.set(!this.expanded());
  }
}
