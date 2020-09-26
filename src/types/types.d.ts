
type taskId = string

export interface Task {
  readonly id: string;
  readonly name: string;
  /**
   * labour result is subscribing to proper state transition on
   * entity it concerns (e.g. expectation to win in battle encounter)
   */
  readonly labours: any[];
  /**
   * effect result is usually immediate (e.g. granting currenty)
   */
  readonly effects: any[];

  allowed: boolean;
  active: boolean; // allowed && !done
  done: boolean;
  isFirstTask: boolean;
  isLastTask: boolean;
  formerTask: taskId;
  nextTasks: taskId[];
}
/*
  Task needs additional data to form tree structure
*/

export interface Quest {
  tasks: taskId[];
  active: boolean;
  done: boolean;
  failed: boolean;
}

interface Labour {
  labourType: LabourType;
  payload: {
    entityId?: string
  }
}

enum LabourType {
  WinBattle = 'Win battle',
  SelectDialog = 'Select dialog',
  VisitRegion = 'Visit region',
  VisitLocation = 'Visit location',
  VisitMarker = 'Visit marker',
  ObtainItem = 'Obtain item',

  Custom = 'Custom labour'
}

interface Effect {
  effectType: EffectType,
  payload: {
    entityId?: string
  }
}

enum EffectType {
  GrantExperience = 'Grant experience points',
  GrantCurrency = 'Grant currency',
  RemoveCurrency = 'Remove currency',
  GrantItem = 'Grant item',
  RemoveItem = 'Remove item',
  EnableDialog = 'Enable dialog',
  DisableDialog = 'Remove dialog',
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

  Custom = 'Custom effect',
}


export function AllowQuest(id: string): void

export function AllowNextTask(id: string): void

export function SetTaskWatchers(): void

export function FinishQuest(questId: string): void

/**
 * Check if all existing not-done quests have active
 * initiationTask or Task.
 */
export function ValidateQuests(): void


interface Journal {}

interface Conversations {}

interface JournalEntry {}

interface QuestTracker {}

interface DialogOptions {}


type agentId = string

type groupId = string

interface Dialog {
  type: DialogType;
  agentId?: agentId;
  groupId?: groupdId;
}

type utteranceId = string

interface Utterance {
  id: utteranceId,
  agent: agentId,
  content: string,
  formerUtterance: utteranceId,
  nextUtterances: utteranceId[],
}

export function Prompter(agentId: string): DialogOptions

interface Location {}

interface Region {}


