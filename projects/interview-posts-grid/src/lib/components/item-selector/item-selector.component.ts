import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { itemSelector } from '../../state';
import { AppState } from '../../types/items';
import { FolderComponent } from '../folder/folder.component';

@Component({
  selector: 'app-item-selector',
  imports: [CommonModule, FolderComponent],
  templateUrl: './item-selector.component.html',
  styleUrl: './item-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemSelectorComponent {
  rootFolders$ = this.store.pipe(select(itemSelector.selectRootFolders));
  selectedItemIds$ = this.store.pipe(select(itemSelector.selectCheckedItemIds));

  constructor(private store: Store<AppState>) {}

  clearSelection() {
    this.store.dispatch(itemSelector.clearCheckedItems());
  }
}
