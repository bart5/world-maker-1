
type taskId = string
type questId = string
type actorId = string
type groupId = string
type dialogId = string
type dialogLineId = string
type journalEntryId = string
type regionId = string
type locationId = string
type regionMapId = string
type locationMapId = string
type MarkerId = string
type roadId = string
type locationViewId = string
type DungeonMapId = string

export interface Task {
  id: taskId;
  name: string;
  questId: questId;
  /**
   * Labours end up as subscriptions to proper state transition on
   * entity they concern (e.g. expectation to win in battle encounter).
   */
  labours: Labour[];
  /**
   * Effect is some immediate result of fulfilling labours (e.g. granting currency).
   */
  effects: Effect[];
  /**
   * Certain states which will result in player failing the task and the quest.
   */
  dealBreakers: Labour[];
  onFailure: Effects[];
  /**
   * Becomes active when previous task is done. Active task generates
   * subscriptions according to labours.
   */
  active: boolean;
  done: boolean;
  failed: boolean;
  /**
   * First task is one that is hidden and is meant to decide
   * if the actual quest should begin.
   * For this reason it will almost always be hidden to the player.
   * First task will generate subscriptions just as the game world is booted.
   */
  isFirstTask: boolean;
  /**
   * Last task, when done, marks entire quest as done also.
   */
  isLastTask: boolean;
  formerTask: taskId;
  nextTasks: taskId[]; // most of the times there will be just one next task
}

/**
 * Quest is just a wrapper for tasks which are *the* meat and potatoes
 * of the quest-system.
 */
export interface Quest {
  id: questId;
  name: string;
  firstTask: taskId;
  /**
   * is active when is neither done nor failed nor obsolete
   */
  active: boolean;
  done: boolean;
  failed: boolean;
  /**
   * Obsolete quest is one that from world-consistency standpoint
   * has no longer reason to exist.
   */
  obsolete: boolean;
  dialog: dialogId;
}

export interface Labour {
  labourType: LabourType;
  payload?: {
    entityId?: string
  }
}

export enum LabourType {
  WinBattle = 'Win battle',
  LoseBattle = 'Lose battle',
  SelectDialog = 'Select dialog',
  VisitRegion = 'Visit region',
  VisitLocation = 'Visit location',
  VisitMarker = 'Visit marker',
  ObtainItem = 'Obtain item',
  InteractWith = 'Interact with object',

  Custom = 'Custom labour'
}

export interface Effect {
  effectType: EffectType,
  payload: {
    entityId?: string
  }
}

export enum EffectType {
  GrantExperience = 'Grant experience points',
  GrantCurrency = 'Grant currency',
  RemoveCurrency = 'Remove currency',
  GrantItem = 'Grant item',
  RemoveItem = 'Remove item',
  EnableDialog = 'Enable dialog',
  DisableDialog = 'Disable dialog',
  AddMember = 'Add member to the party',
  RemoveMember = 'Remove member from the party',
  UncoverLocation = 'Uncover location',
  GrantSkillPoints = 'Grant skill points',
  RemoveSkillPoints = 'Remove skill points',
  GrantAbility = 'Grant ability',
  RemoveAbility = 'Remove ability',
  RepairItem = 'Repair item',
  TransportParty = 'Transport party',
  GrantLoot = 'Grant loot',
  AddJournalEntry = 'Add journal entry',
  ActivateTask = 'Activate task',
  CompleteQuest = 'Complete quest',
  FailQuest = 'Fail quest',
  TravelToCoordinates = 'Travel to coordinates on the road',
  TravelToMarker = 'Travel to map marker',
  ActivateMarker = 'Activate marker',
  RunScript = 'Run script',
}

/* Journal */

/**
 * Journal keeps quest-related entires.
 * Entries are created as effects of tasks.
 */
export interface Journal {
  activeQuests: {
    [questId as string]: Array<JournalEntry> // later filtered by date for display
  };
  completedQests: {
    [questId as string]: Array<JournalEntry>
  };
  failedQuests: {
    [questId as string]: Array<JournalEntry>
  };
}

interface JournalEntry {
  id: journalEntryId;
  questId: questId;
  entryDate: string;
}

/* Conversations */

/**
 * Conversations keep record of lines exchanged with NPCs
 * in order of their appearance.
 * No duplicates.
 */

interface Conversations {
  [actorId as string]: Array<ConversationEntry>
}

interface ConversationEntry {
  id: conversationEntryId;
  actorId: actorId;
  dialogLine: DialogLine;
  entryDate: string;
}

/* Bestiary */

/* Notes about locations and regions */

/* Notes about people */

/* Dialogs */

export interface Dialog {
  id: dialogId;
  /**
   * Allowed dialog is one that user is allowed to see.
   */
  allowed: boolean;
  /**
   * Active dialog is currently displayed.
   */
  active: boolean;
  /**
   * It's meant to disallow certain conversations as a result
   * of story-related developments.
   * Be careful about disabling shared dialog.
   */
  disabled: boolean;
  dirty: boolean;
  /**
   * Private dialogs are ment for only a single actor.
   * Non-private dialog is by definition shared or common,
   * and will be used by many actors.
   */
  isPrivate: boolean;
  /**
   * Priority - single trumps group, e.g.:
   * G1 = [A1, A21], G2 = [A21, A22]
   * + G1 - G2 + A22 => [A1, A22]
   * + G1 - A21 => [A1]
   */
  actorsExcluded?: actorId[];
  groupsExcluded?: groupId[];
  actorsIncluded?: actorId[];
  groupsIncluded?: groupId[];
  startDialogLine: dialogLineId;
}

export interface DialogLine {
  id: dialogLineId;
  dialogId: dialogId;
  actor: actorId;
  content: string;
  formerDialogLine: dialogLineId;
  nextDialogLines: dialogLineId[];
  effects: Effect[];
  /**
   * option number allows manual control of dialog options ordering.
   */
  optionNumber?: number;
}

export function Prompter(actorId: actorId): DialogOptions

/*  */

interface Actor {
  type: actorType;
}

enum ActorType {

}

interface PartyMarker {}

interface PlayerParty {}

interface NpcParty {}

interface Item {
  obj3D: any;
  // ...
}

enum ItemType {

}

/*  */

/**
 * Scene type.
 *
 * Region is presented as a (largely) 2D map.
 * It is the largest part of game-world that player is presented with at once.
 *
 * Region should always synonymous with some world part that can
 * also be seen as separate in world-building terms.
 */
interface Region {
  name: string;
  id: regionId;
  locations: Array<locationId>;
  map: regionMapId;
}

interface RegionMap {
  id: regionMapId;
  markers: Array<Marker>;
  width: number;
  height: number;
  roads: Array<Road>;
  data: unknown;
}

/**
 * It represents real road on which entities on the map
 * can move.
 *
 * Most likely it's some kind of bit format that should be
 * possible to interpret both on JS side and Unreal side.
 * It should also be editable on both ends.
 *
 * It would be perfect if Maker could scan roads drawn
 * on maps and turn them into meaningful data.
 */
interface Road {
  name: string;
  id: roadId;
  map: regionMapId;
  data: unknown;
}

/**
 * Scene type.
 *
 * Location is a 3D level.
 */
interface Location {
  type: LocationType;
  name: string;
  id: locationId;
  parentRegion: regionId;
  locations: Array<locationId>;
  parentLocation?: locationId;
}

enum LocationType {
  level = 'Explorable level type location',
  overview = 'Overview type location',
  interior = 'Interior type location',
  camp = 'Camp type location',
}

interface Dungeon extends Location {
  level: DungeonLevel;
  map: DungeonMap;
}

interface Settlement extends Location {
  level: SettlementLevel;
  inhabitants: Array<Actors>;
}

interface Interior extends Location {
  capacity: number;
  type: InteriorType;
  typeVariant: unknown;
}

interface Camp extends Location {
  type: CampType;
  typeVariant: unknown;
}

interface DungeonLevel {
  id: levelId;
  data?: any;
}

interface SettlementLevel {
  id: levelId;
  data?: any;
}

interface DungeonMap {
  id: DungeonMapId;
  markers: Array<Marker>;
  width: number;
  height: number;
  data: unknown;
}

/**
 * Marker on a map.
 * Has different function depending on it's type.
 */
interface Marker {
  name: string,
  id: MarkerId;
  type: MarkerType;
  location: locationId;
  parentMap?: mapId;
  parentLocations?: locationId;
  hidden: boolean;
  coordinates: {
    x: number,
    y: number,
  };
}

enum MarkerType {
  toLevel = 'Marker leading to location scene',
  toRegion = 'Marker leading to region scene',
  toOverview = 'Marker opening location overview scene',
  toInterior = 'Marker opening interior view scene',
  toDialog = 'Marker opening dialog UI',
  enemy = 'Marker opening enemy interaction UI',
  regionMapObject = 'Marker for generic region map object',
}

/**
 * Scene type.
 *
 * Simplified presentation of a location - an overview
 * with points of interest highlighted.
 *
 * It has fixed camera and you don't move your party around.
 */
interface Overview {
  name: string;
  id: overviewId;
  locations: Array<Marker>;
  data?: unknown; // Unknown data describing 3D scene
}

/**
 * Scene type.
 *
 * ????
 */
interface InteriorView {
  name: string;
  id: locationViewId;
  scenes: Array<InteriorScene>;
}

interface Overview {
  name: string;
  id: locationViewId;
}

interface CampView {
  name: string;
  id: locationViewId;
}

/**
 * Scene type.
 *
 * ????
 */
interface CityView {
  name: string;
  id: locationViewId;
  scenes: Array<InteriorScene>;
}

interface DialogBackground {}

interface DialogUI {

}

/**
 * Scene type.
 *
 * View of camping party.
 * Provides interface for interaction allowed only during camping.
 */
interface CampView {
  name: string;
  id: locationViewId;
  scene3d: scene3dId;
}



interface DialogInteraction {}

interface TradeInteraction {}


interface PartyUI {}

interface PartyMemberUI {}



/*  */

/**
 * This is dev-time debug
 *
 * On game state initiation look for unfinishable quests
 */
export function ValidateQuests(): void


/* Game state inspector */

/**
 * Game state is minimal required information that feed
 * to the game allows restoring it's state from any
 * previous time that the information pertains to.
 *
 * That information is easiet to determine by taking look
 * at any mutations that game systems allow.
 * Everything that is mutated at least once is stateful
 * and should be possible to save.
 */

interface GameWorldState {}

/**
 * Properties that may be constant, or that are modifiable
 * independently on the in-game operations and can vary
 * for two identical states running at different points in time.
 *
 * Examples of this modifiable data:
 *  - quotients and stats modifying slightly game mechanics
 *  - graphical, audio and gameplay settings
 */
interface GameConfiguration {}

interface GameController {}
