/**
 * the data structure in get-items.json could theoretically be dynamically
 * ingested, but this would substantially increase complexity. Without a
 * readily apparent need for this investment, we'll stick with a simple static
 * definition for now.
 */
type ColumnDef = [string, string, string];
export type FolderRaw = [number, string, number];
export type ItemRaw = [number, string, number];

export const COLUMN_ID = 0;
export const COLUMN_TITLE = 1;
export const COLUMN_PARENT_ID = 2;

interface TableData<T> {
  columns: ColumnDef[];
  data: T[];
}

export interface GetItemsResponse {
  folders: TableData<FolderRaw>;
  items: TableData<ItemRaw>;
}

/**
 * There's a few potential approaches to this reducer structure:
 * > storing + returning only a list of nodes with child IDs (chosen)
 *   +++ simplest data structure, more selector/CD granularity
 *   --- more complex selectors
 * > internally storing a list of nodes, and returning a data structure with
 *   references to other items in the data structure:
 *   --- intuitive and easy to work with, more powerful
 *   --- likely worse performance and potentially gotcha's with selectors
 *
 * Originally looked at more cohesive data structure based on a "TreeNode", but
 * the value turned out to be limited.
 */

export interface Item {
  id: number;
  title: string;
  folderId: number;
}

export interface Folder {
  id: number;
  title: string;
  parentId: number;
}

export interface ItemSelectorFeatureState {
  allItems: Record<string, Item>;
  allFolders: Record<string, Folder>;
  checkedItemIds: number[];
}

export interface AppState {
  itemSelector: ItemSelectorFeatureState;
}
