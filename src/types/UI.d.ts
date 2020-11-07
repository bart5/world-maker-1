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

type ChangeType =
  | 'createType'
  // 1 step:
  //  1) creates type. (subjects = null)
  | 'removeType'
  // 3 steps:
  //  1) removes references FROM all instances of type. (subjects = [all instances of type])
  //  2) removes references TO all instances. (subjects = [all instances of type])
  //  3) removes all instances. (subjects = [all instances of type])
  | 'renameType'
  // 1 step:
  //  1) changes name in typeWrapper and meta_typeName in all instances. (subjects = typeWrapper + [all instances of type])
  | 'createProp'
  // 1 step:
  //  1) create prop for type and create props for all instances. (subjects = typeWrapper + [all instances of type])
  | 'renameProp'
  // 1 step:
  //  1) rename prop in type, rename prop in all instances. (subjects = typeWrapper + [all instances of type])
  | 'changePropValue_int32<->flt' // cast with trimmed precision
  | 'changePropValue_int32<->string' // literal cast
  | 'changePropValue_int32<->bool' // cast to 1 or 0 and true or false
  | 'changePropValue_flt<->string' // literal cast
  | 'changePropValue_flt<->bool' // cast to 1 or 0 and true or false
  | 'changePropValue_string<->bool' // cast to 'true' or 'false' and (from string) true or false
  // 1 step:
  //  1) change valueType in typeWrappe and instances and instances props values. (subjects = typeWrapper + [all instances of type])
  // occurs in type, instant effect on type and all instances (cast to other type (if possible))
                          // If prop was a reference it first acts as changePropRefValues as if removing all values
  | 'changePropRefTarget' // it first removes all ref values from instances with this prop
  | 'changePropRefValues' // instance and meta of other instances
  | 'changePropValues' // only instance (non ref change)
  | ''

type ChangeActionType = 'create' | 'remove' | 'rename' | 'update'
type ChangeSubjectType = 'type' | 'instance' | 'propDef' | 'instanceProp'

interface Change {
  id: string;
  entityBefore: TypeWrapper | Instance | null
  actionType: ChangeActionType;
  subjectType: ChangeSubjectType;
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

type ValueType = 'int32' | 'flt' | 'string' | 'bool' | 'ref'
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
  // meta_typeName: PropDefinition;
  // meta_isBoundTo: PropDefinition;
  // meta_isReferencing: PropDefinition;
  // meta_isReferencedBy: PropDefinition;
}

interface TypeDefinition extends TypeBasics {
  [propName: string]: PropDefinition;
}

interface PropDefinition {
  valueType: ValueType;
  name: string;
  isArray?: bool;
  // isRef?: boolean;
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
  id: InstanceProp<[string]>;
  meta_typeName: InstanceProp<[string]>;
  meta_isBoundTo: InstanceProp<string[]>;
  meta_isReferencing: InstanceProp<string[]>;
  meta_isReferencedBy: InstanceProp<string[]>;
}

interface Instance extends InstanceBasics {
  [propName: string]: InstanceProp;
}

interface InstanceProp<T = Values> {
  valueType: ValueType;
  name: string;
  isArray?: bool;
  values: T;
}
