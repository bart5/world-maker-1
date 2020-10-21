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
  [type in Types]: Array<TypeInstance> | { [id: string]: TypeInstance }
}

interface Types {
  [typeName: string]: TypeDescriptor
}

type instanceID = string;

interface TypeDescriptor {
  name: keyof Types;
  extends?: keyof Types;
  isEnum?: boolean;
  instance: Array<PropertyType>;
}

interface PropertyType {
  name: string;
  type: PropertyTypeDescriptor;
  order: number;
  children?: Array<PropertyType>;
}

interface PropertyInstance {
  name: string;
  type: PropertyTypeDescriptor;
  value: any;
}

type PropertyTypeDescriptor = 'char' | 'uint' | 'int' | 'float' | 'bool' | TypeRef | EnumRef | 'struct' | 'array'

type TypeRef = {
  name: 'typeRef';
  typeRef: keyof Types;
}

type EnumRef = {
  name: 'enumRef';
  enumRef: keyof Types;
}

interface TypeInstance {
  id: instanceID;
  [propertName: string]: PropertyInstance;
}

type PropertyInstance = PrimitiveTypeValue | TypeReference | EnumTypeValue | StructContainer | ArrayContainer

type PrimitiveTypeValue = CharValue | NumericValue | BoolValue

interface CharValue {
  name: string;
  type: 'char';
  value: string;
}

interface NumericValue {
  name: string;
  type: 'uint' | 'int' | 'float';
  value: number;
}

interface BoolValue {
  name: string;
  type: 'bool';
  value: boolean;
}

interface TypeReference {
  name: string;
  type: keyof Types;
  value: instanceID;
}

interface EnumTypeValue {
  name: string;
  type: keyof Types;
  value: string;
}

interface StructContainer {
  name: string;
  type: 'struct';
  value: { [k: string]: PropertyValueDescriptor };
}

interface ArrayContainer {
  name: string;
  type: 'array';
  value: Array<PropertyValueDescriptor>;
}
