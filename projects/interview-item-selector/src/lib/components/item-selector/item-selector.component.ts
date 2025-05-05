import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';

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
  rootFolders = this.store.selectSignal(itemSelector.selectRootFolders);
  selectedItemIds = this.store.selectSignal(itemSelector.selectCheckedItemIds);

  constructor(private store: Store<AppState>) {}

  clearSelection() {
    this.store.dispatch(itemSelector.clearCheckedItems());
  }
}
