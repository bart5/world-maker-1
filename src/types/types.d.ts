
type taskId = string
type questId = string
type agentId = string
type groupId = string
type dialogId = string
type lineId = string
type journalEntryId = string
type regionMapId = string
type locationMapId = string
type regionId = string
type locationId = string
type mapMarkerId = string

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
  [agentId as string]: Array<ConversationEntry>
}

interface ConversationEntry {
  id: conversationEntryId;
  agentId: agentId;
  line: Line;
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
   * Private dialogs are ment for only a single agent.
   * Non-private dialog is by definition shared or common,
   * and will be used by many agents.
   */
  isPrivate: boolean;
  /**
   * Priority:
   * G1 = [A1, A21]
   * G2 = [A21, A22]
   * + G1 - G2 + A1 + A22 => [A1, A22]
   * + G1 - A21 => [A1]
   */
  agentsExcluded?: agentId[];
  groupsExcluded?: groupId[];
  agentsIncluded?: agentId[];
  groupsIncluded?: groupId[];
  startLine: lineId;
}

export interface Line {
  id: lineId;
  dialogId: dialogId;
  agent: agentId;
  content: string;
  formerLine: lineId;
  nextLines: lineId[];
  effects: Effect[];
  /**
   * option number allows manual control of dialog options ordering.
   */
  optionNumber?: number;
}

export function Prompter(agentId: agentId): DialogOptions

/*  */

interface Agent {}

interface Party {}

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
  map: regionMapId;
}

interface RegionMap {
  id: regionMapId;
}

/**
 * Scene type.
 *
 * Location is a 3D level.
 */
interface Location {
  name: string,
  id: locationId;
  map: locationMapId;
}

interface LocationMap {
  id: locationMapId;
}

/**
 * Marker on a map.
 * Has different function depending on it's type.
 */
interface MapMarker {
  name: string,
  id: mapMarkerId;
  type: MapMarkerType;
  parentMap: mapId;
}

enum MapMarkerType {

}

/**
 * Scene type.
 *
 * Simplified presentation of a location, usually and overview
 * with highlights of points of interests.
 */
interface LocationView {}

/**
 * Scene type.
 *
 * Interior view shows insides of some building.
 * It is similar to LocationView in that it also provides
 * some form of highlight of 'interactables'.
 */
interface InteriorView {}

/**
 * Scene type.
 *
 * View of camping party.
 * Provides interface for interaction allowed only during camping.
 */
interface CampView {}



interface DialogInteraction {}

interface TradeInteraction {}


interface PartyUI {}

interface CharacterUI {}




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
