type tileId = string
type workspaceId = string
type projectId = string

interface ProjectRef {
  name: string;
  id: string;
  projectConfigPath: string;
}

interface ApplicationData {
  projects: {
    [projectId: string]: ProjectRef
  };
  lastProjectId: string;
}

interface WorkspaceConfiguration {
  modulus: number;
  fitToTiles: boolean;
  lockScale: boolean;
  lockedScale: number;
  lockView: boolean;
  lockedViewPosition: {};
  lockTiles: boolean;
  lastSessionCamera: Camera | null;
}

interface ProjectConfig {
  name: string;
  id: projectId;
  localSavePath: string,
  remoteSavePath: string,
  allowAutosave: boolean;
  autosaveInterval: number;
  autosavePrefix: string;
}

interface ProjectData {
  staticData: StaticData;
  assetMappings: AssetMappings;
  project: Project;
}

interface Workspace {
  id: workspaceId;
  name: string;
  order: number;
  configuration: WorkspaceConfiguration
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
  inputSource: tileId;
  filter: any;
  hideConnectors: boolean;
  zIndex: number;
  output: {
    allData: any,
    slectionData: any,
  }
}

interface Project {
  id: string;
  name: string;
  workspaces: Array<Workspace>;
  tiles: Array<Tile>;
  staticDataPath: string;
  assetsPath: string;
  activeWorkspaceId: workspaceId;
}

interface ApplicationState {
  // loadingStaticData: boolean;
  applicationData: ApplicationData | null;
  project: Project;
  projectData: ProjectData | null;
  ui: UIState;
}

interface UIState {
  connectingInProgress: boolean;
  tileDeletionInProgress: boolean;
  workspaceDeletionInProgress: boolean;
  selectedInputSourceTile: tileId;
  showConfigurationModal: boolean;
}

interface Coords {
  x: number,
  y: number
}

interface Camera {
  x: number,
  y: number,
  scale: number,
}
