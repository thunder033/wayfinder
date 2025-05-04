import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Store } from '@ngrx/store';

import { itemSelector } from '../../state';
import { AppState } from '../../types/items';

@Component({
  selector: 'app-item',
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--level]': 'this.level()',
  },
})
export class ItemComponent {
  // this component ended up being clearly simpler to implement with signals over RxJS
  id = input.required<number>();
  level = input(1);
  item = computed(() => this.store.selectSignal(itemSelector.selectItem(this.id()))());

  constructor(private store: Store<AppState>) {}

  toggleChecked() {
    const item = this.item();
    this.store.dispatch(
      item.isChecked ? itemSelector.uncheckItem(item) : itemSelector.checkItem(item),
    );
  }
}
