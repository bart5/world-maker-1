type tileId = string
type workspaceId = string
type tileBoxId = string

interface Workspace {
  id: workspaceId;
  name: string;
  order: number;
}

interface Block {
  width: number;
  height: number;
  /**
   * For Tile it's position withing Workspace window
   * or within TileBox if it resides in one.
   *
   * For TileBox it's position withing Workspace window.
   */
  x: number;
  y: number;
}

interface Tile extends Block {
  id: tileId;
  name: string;
  workspaceId: string;
  boxId: string;
  inputTile: tileId;
  filter: any;
  hideConnectors: boolean;
}

interface TileBox extends Block {
  id: tileBoxId;
}

interface Project {
  id: string;
  name: string;
  workspaces: Array<Workspace>;
  tiles: Array<Tile>;
  boxes: Array<TileBox>;
  staticDataPath: string;
  assetsPath: string;
  activeWorkspaceId: workspaceId;
  // dataSchema: DataSchema;
}

interface userSettings {
  newTileSpawn: 'horizontal' | 'vertical';
}

interface DataSchema {}

interface UIState {
  project: Project;
}
