import { createSelector } from '@ngrx/store';

import { AppState, Folder, Item, ItemSelectorFeatureState } from '../types/items';

const getItemSelectorState = (state: AppState) => state.itemSelector;
const getAllItems = (state: ItemSelectorFeatureState) => state.allItems;
const getAllFolders = (state: ItemSelectorFeatureState) => state.allFolders;
const getCheckedItemIds = (state: ItemSelectorFeatureState) => state.checkedItemIds;
const getRootFolders = (allFolders: Record<string, Folder>) =>
  Object.values(allFolders).filter((folder) => !folder.parentId);

const getCheckedItems = (checkedItemIds: number[], allItems: Record<string, Item>) =>
  checkedItemIds.map((id) => allItems[id]);

const getParentIds = (folder: Folder, allFolders: Record<string, Folder>): number[] => {
  return folder.parentId
    ? [folder.parentId, ...getParentIds(allFolders[folder.parentId], allFolders)]
    : [];
};

const getItemFolderIds = (item: Item, allFolders: Record<string, Folder>): number[] => {
  return [item.folderId, ...getParentIds(allFolders[item.folderId], allFolders)];
};

export const getIsItemInFolder = (
  item: Item,
  folderId: number,
  allFolders: Record<string, Folder>,
) => {
  return getItemFolderIds(item, allFolders).includes(folderId);
};

export const getDeepChildItems = (
  folderId: number,
  allItems: Record<string, Item>,
  allFolders: Record<string, Folder>,
): Item[] => {
  return Object.values(allItems).filter((item) => getIsItemInFolder(item, folderId, allFolders));
};

export const getChildItems = (folderId: number, allItems: Record<string, Item>): Item[] => {
  return Object.values(allItems)
    .filter((item) => item.folderId === folderId)
    .sort((a, b) => a.title.localeCompare(b.title));
};

export const getChildFolders = (folderId: number, allFolders: Record<string, Folder>): Folder[] => {
  return Object.values(allFolders)
    .filter((item) => item.parentId === folderId)
    .sort((a, b) => a.title.localeCompare(b.title));
};

export const getFolderHasAnyCheckedItems = (
  folderId: number,
  checkedItems: Item[],
  allFolders: Record<string, Folder>,
): boolean => {
  return checkedItems.some((item) => getIsItemInFolder(item, folderId, allFolders));
};

export const getFolderHasAllCheckedItems = (
  folderId: number,
  allItems: Record<string, Item>,
  allFolders: Record<string, Folder>,
  selectedItemIds: number[],
): boolean => {
  return getDeepChildItems(folderId, allItems, allFolders).every((item) =>
    selectedItemIds.includes(item.id),
  );
};

const selectAllItems = createSelector(getItemSelectorState, getAllItems);
const selectAllFolders = createSelector(getItemSelectorState, getAllFolders);
const selectCheckedItemIds = createSelector(getItemSelectorState, getCheckedItemIds);
const selectCheckedItems = createSelector(selectCheckedItemIds, selectAllItems, getCheckedItems);

export const itemSelectorSelectors = {
  selectRootFolders: createSelector(selectAllFolders, getRootFolders),
  selectFolder: (id: number) => createSelector(selectAllFolders, (folders) => folders[id]),
  selectItem: (id: number) =>
    createSelector(selectAllItems, selectCheckedItemIds, (items, checkedItemIds) => ({
      ...items[id],
      isChecked: checkedItemIds.includes(id),
    })),
  selectCheckedItemIds,
  selectChildItems: (folderId: number) =>
    createSelector(selectAllItems, (allItems) => getChildItems(folderId, allItems)),
  selectChildFolders: (folderId: number) =>
    createSelector(selectAllFolders, (allFolders) => getChildFolders(folderId, allFolders)),
  selectFolderHasAnyCheckedItems: (folderId: number) =>
    createSelector(selectCheckedItems, selectAllFolders, (checkedItems, allFolders) =>
      getFolderHasAnyCheckedItems(folderId, checkedItems, allFolders),
    ),
  selectFolderHasAllCheckedItems: (folderId: number) =>
    createSelector(
      selectAllItems,
      selectAllFolders,
      selectCheckedItemIds,
      (allItems, allFolders, checkedItemIds) =>
        getFolderHasAllCheckedItems(folderId, allItems, allFolders, checkedItemIds),
    ),
};
