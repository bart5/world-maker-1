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
  boards: Boards;
  activeWorkspaceId: workspaceId;
}

interface Project {
  instances: Instances;
  types: TypesDefinitions;
  recentChanges: Array<Transaction>;
  uiData: UiData;
}

interface ApplicationState {
  applicationData: ApplicationData | null;
  project: Project;
  currentTransaction: Transaction | null;
  projectUiDataMutated: boolean;
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
  currentBoardData: { boardFrame: HTMLElement, board: HTMLElement } | null;
  activeWidgetKey: number;
  lastSavedTransactionId: string;
  lastRevertedTransactions: Array<Transaction>;
}

interface Board {
  id: string;
  tiles: Array<Tile>;
  config: BoardConfig;
  camera: Camera | null;
}

interface Boards {
  types: {
    types: Board
  };
  quests: {
    [k: string]: Board
  };
  dialogs: {
    [k: string]: Board;
  }
}

interface BoardConfig {
  width: number;
  height: number;
  modulus: number;
  fitToTiles: boolean;
  lockScale: boolean;
  lockedScale: number;
  lockView: boolean;
  lockedViewPosition: {};
  lockTiles: boolean;
}

type WorkspaceType = 'types' | 'quests' | 'dialogs'

type boardId = string

interface Workspace {
  id: workspaceId;
  type: WorkpsaceType;
  name: string;
  order: number;
  activeBoardId: string;
}

interface Tile extends Block {
  entityId: string;
  inputSource: tileId;
  zIndex: number;
  width: number;
  height: number;
  // Tile's position withing Board.
  x: number;
  y: number;
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

  interface Transaction {
    id: string;
    actionType: ActionType | 'initialState';
    changes: Array<Change>;
  }

  type ActionType =
    | 'createType'
    // 1 step:
    //  1) creates type. (subjects = typeWrapper to remove)
    | 'removeType'
    // 5 steps:
    //  1) removes references FROM all instances of type. (subjects = [all instances of type])
    //  2) removes references TO all instances of type. (subjects = [some instances of some types])
    //  3) removes all instances. (subjects = [all instances of type])
    //  4) remove all references in types propDefs
    //  5) remove the type itself
    | 'renameType'
    // 1 step:
    //  1) changes name in typeWrapper and meta_typeId in all instances. (subjects = typeWrapper + [all instances of type])
    | 'createProp'
    // 1 step:
    //  1) create prop for type and create props for all instances. (subjects = typeWrapper + [all instances of type])
    | 'removeProp'
    //
    //  1) remove all references from property to other instances
    //  2) Remove property from type and instances
    | 'renameProp'
    // 1 step:
    //  1) rename prop in type, rename prop in all instances. (subjects = typeWrapper + [all instances of type])
    | 'movePropUp'
    | 'movePropDown'
    | 'changePropType' // cast with trimmed precision
    // | 'changePropType_int32<->flt' // cast with trimmed precision
    // | 'changePropType_int32<->string' // literal cast
    // | 'changePropType_int32<->bool' // cast to 1 or 0 and true or false
    // | 'changePropType_flt<->string' // literal cast
    // | 'changePropType_flt<->bool' // cast to 1 or 0 and true or false
    // | 'changePropType_string<->bool' // cast to 'true' or 'false' and (from string) true or false
    // 1 step:
    //  1) change valueType in typeWrapper and props of instances. cast props values.
    //    (subjects = typeWrapper + [all instances of type])
    | 'changePropToArray' // lossless
    // 1 step:
    //  1) change arity in prop definition, change arity in props of all instances.
    //    (subjects = typeWrapper + [all instances of type])
    | 'changePropToSingle' // lose all values but first
    // 1 step:
    //  1) change arity in prop definition, change arity in props of all instances. Trim values.
    //    (subjects = typeWrapper + [all instances of type])
    | 'changePropTargetType'
    // 2 steps:
    //  1) Remove *ref values* from prop in all instances of type.
    //    (subjects = [all instances of type] + [other through meta])
    //  2) Change refTargetType in prop of type and props of all instances.
    //    (subjects = typeWrapper + [all instances of type])
    | 'changePropValue'
    // 1 step:
    //  1) Change prop values
    //    (subjects = instance)
    | 'addPropValue'
    | 'removePropValue'
    | 'createInstance'
    | 'removeInstance'
    // | 'changePropOrder'
    // 1 step:
    //  1) Change prop definition order and re-shuffle other
    //    (subjects = type)

  type EntityType = 'TypeWrapper' | 'PropDefinition' | 'Instance' | 'PropValues'

  interface Change {
    entityBefore: TypeWrapper | PropDefinition | Instance | PropValues | null;
    entityType: EntityType
    tId: string;
    iId: string;
    pN: string;
    newName?: string;
  }

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
  meta_typeId: PropDefinition;
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
  isArray: bool;
  refTargetTypeId: string,
  order: number;
}

interface Instances {
  [typeId: string]: InstanceList;
}

interface InstanceList {
  [instanceId: string]: Instance;
}

interface MutArgs {
  newName?: string;
  newType?: ValueType;
  newTargetId?: string; // propRefTargetTypeId
  value?: Values;
  iA?: Instance;
  iB?: Instance;
  propsToCheck?: string[];
  prop?: PropDefinition;
  isArray?: boolean;
  tN?: string; // a type name for creating new instance of a type
  order?: number; // a type name for creating new instance of a type
}

interface MutCtx extends MutArgs {
  tId: string;
  iId: string;
  pN: string;
}

interface PublicActionContext {
  tId?: string;
  iId?: string;
  pN?: string;
  newName?: string;
  newType?: ValueType;
  newTargetId?: string;
  value?: Values;
}

interface InstanceBasics {
  id: PropValues<[string]>;
  meta_typeId: PropValues<[string]>;
  meta_isBoundTo: PropValues<string[]>;
  meta_isReferencing: PropValues<string[]>;
  meta_isReferencedBy: PropValues<string[]>;
}

interface Instance extends InstanceBasics {
  [propName: string]: PropValues;
}

type PropValues<T = Values> = T;

interface PropForExport<T = Values> {
  valueType: ValueType;
  name: string;
  isArray?: bool;
  values: T;
}
