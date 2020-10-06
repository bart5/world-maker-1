type tileId = string
type workspaceId = string

interface Workspace {
  id: workspaceId;
  name: string;
  order: number;
}

interface Block {
  width: number;
  height: number;
  /**
   * For Tile it's position withing Workspace window.
   */
  x: number;
  y: number;
}

interface Tile extends Block {
  id: tileId;
  name: string;
  workspaceId: string;
  providerTile: Tile | null;
  filter: any;
  hideConnectors: boolean;
}

interface Project {
  id: string;
  name: string;
  workspaces: Array<Workspace>;
  tiles: Array<Tile>;
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
  connectingInProgress: boolean;
  providerTileToConnect: tileId | null;
}
