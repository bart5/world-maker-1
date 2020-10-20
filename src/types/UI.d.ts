type tileId = string
type workspaceId = string

interface ApplicationData {
  allowAutosave: boolean;
  /* If there are changes for that long then they will be saved automatically */
  autosaveInterval: number;
  allowBackup: boolean;
  backupInterval: number;
  lastProjectPath: string;
  /* Path to projects directory under appData */
  defaultLocalPath: string;
}

interface UiData {
  workspaces: Array<Workspace>;
  tiles: Array<Tile>;
  staticDataPath: string;
  assetsPath: string;
  activeWorkspaceId: workspaceId;
}

interface Project {
  staticData: StaticData;
  types: Types;
  uiData: UiData;
}

interface ApplicationState {
  applicationData: ApplicationData | null;
  project: Project;
  projectUiDataMutated: boolean;
  projectStaticDataMutated: boolean;
  projectEntityBindingsMutated: boolean;
  ui: UIState;
}

interface UIState {
  connectingInProgress: boolean;
  tileDeletionInProgress: boolean;
  workspaceDeletionInProgress: boolean;
  selectedInputSourceTile: tileId;
  projectDataIsLoaded: boolean;
  openingProjectInProgress: boolean;
  savingProjectInProgress: boolean;
  activeModal: modalTypes;
  lastProjectSaveTime: string;
  lastProjectLoadTime: string;
  frameData: { board: HTMLElement, workspace: HTMLElement } | null;
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

interface Coords {
  x: number,
  y: number
}

interface Camera {
  x: number,
  y: number,
  scale: number,
}

type modalTypes =
  'configuration'
  | 'projectSelector'
  | 'typesManager'
  | null

interface StaticData {
  [type in Types]: Array<TypeDescriptor> | { [id: string]: TypeDescriptor }
}

interface Types {
  [typeName: string]: TypeDescriptor
}

interface Types {
  char: {
    name: 'char';
    instance: string;
  };
  uint: {
    name: 'uint';
    instance: number;
  };
  int: {
    name: 'int';
    instance: number;
  };
  float: {
    name: 'float';
    instance: number;
  };
  bool: {
    name: 'bool';
    instance: boolean;
  };
}

type instanceID = string;

interface TypeDescriptor {
  name: keyof Types;
  extends?: keyof Types;
  instance: InstanceDescriptor;
}

interface InstanceDescriptor {
  id: instanceID;
  [propertName: string]: ValueDescriptor;
}

type ValueDescriptor = PrimitiveTypeValue | TypeReference | EnumTypeValue | StructContainer | ArrayContainer

type PrimitiveTypeValue = CharValue | NumericValue | BoolValue

interface CharValue {
  type: 'char';
  value: string;
}

interface NumericValue {
  type: 'uint' | 'int' | 'float';
  value: number;
}

interface BoolValue {
  type: 'bool';
  value: boolean;
}

interface TypeReference {
  type: keyof Types;
  value: instanceID;
}

type enumKey = string

interface EnumTypeValue {
  type: keyof Types;
  value: enumKey;
}

interface StructContainer {
  type: 'struct';
  value: { [k: string]: ValueDescriptor };
}

interface ArrayContainer {
  type: 'array';
  value: { [k: string]: ValueDescriptor };
}
