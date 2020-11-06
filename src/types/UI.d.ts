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
  /* Path to log of changes */
}

interface UiData {
  workspaces: Array<Workspace>;
  tiles: Array<Tile>;
  activeWorkspaceId: workspaceId;
}

type ChangeActionType = 'create' | 'remove' | 'rename' | 'update'
type ChangeSubjectType = 'type' | 'instance' | 'propDef' | 'instanceProp'

interface ChangeBase {
  entityBefore: TypeWrapper | Instance | null
  actionType: ChangeActionType;
  subjectType: ChangeSubjectType;
}

interface Change extends ChangeBase {
  id: string;
  sideEffects: Array<ChangeBase>;
}

interface Project {
  instances: Instances;
  types: TypesDefinitions;
  uiData: UiData;
}

interface ApplicationState {
  applicationData: ApplicationData | null;
  project: Project;
  changeLog: Array<Change>;
  projectUiDataMutated: boolean;
  projectInstancesMutated: boolean;
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
  | null;

// ===================

type ValueType = 'int32' | 'flt' | 'string' | 'bool'
type Values = Array<number | string | boolean>

// It is suppsed to resemble enum with list of Types
interface Types {
  [typeId: string]: number;
}

interface TypeWrapper {
  name: string,
  id: string,
  definition: TypeDefinition
}

interface TypesDefinitions {
  [typeId: string]: TypeWrapper;
}

interface TypeBasics {
  id: PropDefinition;
  meta_typeName: PropDefinition;
  meta_isBoundTo: PropDefinition;
  meta_isReferencing: PropDefinition;
  meta_isReferencedBy: PropDefinition;
}

interface TypeDefinition extends TypeBasics {
  [propName: string]: PropDefinition;
}

interface PropDefinition {
  valueType: ValueType;
  name: string;
  isArray?: bool;
  isRef?: boolean;
  refTargetTypeId?: string,
  order?: number;
}

interface Instances {
  [typeId: string]: InstanceList;
}

interface InstanceList {
  [instanceId: string]: Instance;
}

interface InstanceBasics {
  id: InstanceProp;
  meta_typeName: InstanceProp;
  meta_isBoundTo: InstanceProp;
  meta_isReferencing: InstanceProp;
  meta_isReferencedBy: InstanceProp;
}

interface Instance extends InstanceBasics {
  [propName: string]: InstanceProp;
}

interface InstanceProp {
  valueType: ValueType;
  name: string;
  isArray?: bool;
  values: Values;
}
