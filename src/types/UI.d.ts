type tileId = string
type workspaceId = string
type tileBoxId = string

interface Workspace {
  id: workspaceId;
  name: string;
  tiles: Array<tileId>;
  boxes: Array<tileBoxId>;
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
  boxId: string | null;
  inputTile: tileId;
  filter: any;
}

interface TileBox extends Block {
  id: tileBoxId;
  tiles: Array<tileId>;
}

interface Project {
  id: string;
  name: string;
  workspaces: Array<Workspace>;
  tiles: Array<Tile>;
  boxes: Array<TileBox>;
  staticDataPath: string;
  assetsPath: string;
  // dataSchema: DataSchema;
}

interface DataSchema {}

interface UIState {
  activeTile: tileId;
  activeWorkspace: workspaceId;
  project: Project;
}
