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

interface Types {
  [typeName: string]: TypeDescriptor
}

interface StaticData {
  [type in Types]: Array<TypeDescriptor> | { [id: string]: TypeDescriptor }
}

interface TypeDescriptor {
  [propertName: string]: ValueDescriptor
}

type ValueDescriptor = PrimitiveValue | PrimitiveValueContained | ObjectValue | ObjectValueContained | EnumValue

type PrimitiveValue = CharValue | IntValue | BoolValue

type PrimitiveValueContained = CharValueContained | IntValueContained | BoolValueContained

interface CharValue {
  value: string,
  valueType: 'char',
}

interface IntValue {
  value: number,
  valueType: 'uint' | 'int' | 'float',
}

interface BoolValue {
  value: boolean,
  valueType: 'bool',
}

interface CharValueContained {
  value: string[],
  valueType: 'char',
}

interface IntValueContained {
  value: number[],
  valueType: 'uint' | 'int' | 'float',
}

interface BoolValueContained {
  value: boolean[],
  valueType: 'bool',
}

type ObjectValue = ObjectValueAsStruct | ObjectValueAsID

interface ObjectValueAsStruct {
  type: keyof Types,
  value: { [k: string]: ValueDescriptor },
  valueType: 'struct',
}

interface ObjectValueAsID {
  type: keyof Types,
  value: string,
  valueType: 'id',
}

type ObjectValueContained = ObjectValueAsStructContained | ObjectValueAsIDContained

interface ObjectValueAsStructContained {
  type: keyof Types,
  value: { [k: string]: { [k: string]: ValueDescriptor } } | Array<{ [k: string]: ValueDescriptor }>,
  valueType: 'struct',
  container: 'struct' | 'array'
}

interface ObjectValueAsIDContained {
  type: keyof Types,
  value: { [k: string]: string } | Array<string>,
  valueType: 'id',
  container: 'struct' | 'array'
}

interface EnumValue {
  type: keyof Types,
  value: string,
  valueType: 'char',
}
