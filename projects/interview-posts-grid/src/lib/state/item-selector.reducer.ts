import { createAction, createReducer, on, props } from '@ngrx/store';
import { difference, uniq } from 'lodash';

import { getDeepChildItems } from './item-selector.selctors';
import {
  COLUMN_ID,
  COLUMN_PARENT_ID,
  COLUMN_TITLE,
  Folder,
  FolderRaw,
  Item,
  ItemRaw,
  ItemSelectorFeatureState,
} from '../types/items';

export const itemSelectorDefaultState = {
  allItems: {},
  allFolders: {},
  checkedItemIds: [] as number[],
} satisfies ItemSelectorFeatureState;

export const itemSelectorActions = {
  loadFolder: createAction('ITEMS::LOAD_FOLDER', props<{ rawFolder: FolderRaw }>()),
  loadItem: createAction('ITEMS::LOAD_ITEM', props<{ rawItem: ItemRaw }>()),
  checkItem: createAction('ITEMS::CHECK_ITEM', props<{ id: number }>()),
  uncheckItem: createAction('ITEMS::UNCHECK_ITEM', props<{ id: number }>()),
  checkFolder: createAction('ITEMS::CHECK_FOLDER', props<{ id: number }>()),
  uncheckFolder: createAction('ITEMS::UNCHECK_FOLDER', props<{ id: number }>()),
  clearCheckedItems: createAction('ITEMS::CLEAR_CHECKED_ITEMS'),
};

const getItemFromRaw = (rawItem: ItemRaw): Item => ({
  id: rawItem[COLUMN_ID],
  title: rawItem[COLUMN_TITLE],
  folderId: rawItem[COLUMN_PARENT_ID],
});

const getFolderFromRaw = (rawItem: ItemRaw): Folder => ({
  id: rawItem[COLUMN_ID],
  title: rawItem[COLUMN_TITLE],
  parentId: rawItem[COLUMN_PARENT_ID],
});

export const itemSelectorReducer = createReducer(
  itemSelectorDefaultState,
  on(
    itemSelectorActions.loadItem,
    (state, { rawItem }) =>
      ({
        ...state,
        allItems: { ...state.allItems, [rawItem[COLUMN_ID]]: getItemFromRaw(rawItem) },
      } satisfies ItemSelectorFeatureState),
  ),
  on(
    itemSelectorActions.loadFolder,
    (state, { rawFolder }) =>
      ({
        ...state,
        allFolders: { ...state.allFolders, [rawFolder[COLUMN_ID]]: getFolderFromRaw(rawFolder) },
      } satisfies ItemSelectorFeatureState),
  ),
  on(itemSelectorActions.checkItem, (state, { id }) => ({
    ...state,
    checkedItemIds: uniq([...state.checkedItemIds, id]),
  })),
  on(itemSelectorActions.uncheckItem, (state, { id: removeId }) => ({
    ...state,
    checkedItemIds: state.checkedItemIds.filter((id) => id !== removeId),
  })),
  on(itemSelectorActions.checkFolder, (state, { id }) => ({
    ...state,
    checkedItemIds: uniq([
      ...state.checkedItemIds,
      ...getDeepChildItems(id, state.allItems, state.allFolders).map((item) => item.id),
    ]),
  })),
  on(itemSelectorActions.uncheckFolder, (state, { id }) => ({
    ...state,
    checkedItemIds: difference(
      state.checkedItemIds,
      getDeepChildItems(id, state.allItems, state.allFolders).map((item) => item.id),
    ),
  })),
  on(itemSelectorActions.clearCheckedItems, (state) => ({ ...state, checkedItemIds: [] })),
);
