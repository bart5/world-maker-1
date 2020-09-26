
type taskId = string
type questId = string
type agentId = string
type groupId = string
type dialogId = string
type lineId = string
type journalEntryId = string

export interface Task {
  id: taskId;
  name: string;
  lineId: lineId;
  /**
   * labours end up as subscriptions to proper state transition on
   * entity they concern (e.g. expectation to win in battle encounter)
   */
  labours: Labour[];
  /**
   * effect is some immediate result of fulfilling labours (e.g. granting currenty)
   */
  effects: Effect[];
  /**
   * Certain states which will result in player failing the task and the quest.
   */
  dealBreakers?: Labour[];
  onFailure: Effects[];
  /**
   * Becomes active when previous task is done. Active task generates
   * subscriptions according to labours.
   */
  active: boolean;
  done: boolean;
  failed: boolean;
  /**
   * First task is one that is hidden and is meant to establish
   * if actual quest should begin.
   * For this reason it will almost always be hidden to the player.
   * First task will generate subscriptions just as
   * the game world is booted.
   */
  isFirstTask: boolean;
  /**
   * Last task, when done, marks entire quest as done also.
   */
  isLastTask: boolean;
  formerTask: taskId;
  nextTasks: taskId[]; // most of the times there is just one next task
}
/*
  Task needs additional data to form tree structure
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
  dialog?: dialogId;
}

export interface Labour {
  labourType: LabourType;
  payload: {
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

interface Journal {
  activeQuests: JournalEntry[];
  completedQests: JournalEntry[];
  failedQuests: JournalEntry[];
}

interface JournalEntry {
  id: journalEntryId;
  entryDate: string;
  questId: questId;
}

type Conversations = Array<Conversation>

interface Conversation {
  agentId: agentId;
  line: Line;
}

export interface Dialog {
  id: dialogId;
  /**
   * Allowed dialog is one that user is eligible to see.
   */
  allowed: boolean;
  /**
   * Active dialog is currently displayed.
   */
  active: boolean;
  /**
   * It's meant to disallow certain conversations as special effect
   * of some story-related developments.
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
  agentsIncluded?: agentId[];
  agentsExcluded?: agentId[];
  groupsIncluded?: groupId[];
  groupsExcluded?: groupId[];
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


/*  */

interface Location {}

interface Region {}


/*  */

/*
  Identify which values can mutate and thus should be saved.
*/

interface SavedGame {}

/*  */

/**
 * This is dev-time debug
 *
 * On game state initiation look for unfinishable quests
 */
export function ValidateQuests(): void
