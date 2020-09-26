export interface Task {
  readonly id: string;
  readonly name: string;
  readonly labours: any[];
  readonly effects: any[];

  allowed: boolean;
  active: boolean; // allowed && !done
  done: boolean;
}

export interface InitiationTask {
  readonly labours: any[];
  readonly allowQuests: AllowQuest;
  readonly allowed: true;
  readonly active: true;

  done: boolean;
}

export interface Quest {
  initiationTask: InitiationTask;
  tasks: Task[];

  allowed: boolean;
  active: boolean;
  done: boolean;
}


interface ActiveQuests {

}

interface Labour {
  target;

}


export function Labour(battleId: string): boolean
export function Labour(dialogId: string): boolean
export function Labour(itemId: string): boolean

enum LabourType {

}

enum EffectType {

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


/*
  FLOW

  At the beginning of the game we go through all the quests.
  All initiation tasks attach their triggers.

*/

