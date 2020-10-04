/**
 * This file keeps template for proper forms display
 * of all game related objects.
 */

type StaticDataTemplate = {
  quest: FormTemplate<Quest>,
  task: FormTemplate<Task>
}

enum InputType {}

type FormTemplate<T extends {}> = {
  [K in keyof T]: {
    name: string;
    label?: string;
    default: T[K];
    inputType?: InputType;
    readonly: boolean;
    tooltip?: string;
  } | null // null indicates a value that doesn't have to be presented in the form
}

export const formTemplates: StaticDataTemplate = {
  quest: {
    id: {
      name: 'id',
      label: 'questId',
      default: '0',
      readonly: true
    },
    name: {
      name: 'name',
      label: 'name',
      default: 'Placeholder name',
      readonly: false
    },
    firstTask: null,
    active: null,
    done: null,
    failed: null,
    obsolete: null,
  },
  task: {
    id: {
      name: 'id',
      label: 'taskId',
      default: '0',
      readonly: true
    },
    name: {
      name: 'name',
      label: 'name',
      default: 'Placeholder name',
      readonly: false
    },
    questId: null,
    successConditions: {
      name: 'successConditions',
      label: 'successConditions',
      default: [],
      readonly: false
    },
    onSuccess: {
      name: 'onSuccess',
      label: 'onSuccess',
      default: [],
      readonly: false
    },
    failureConditions: {
      name: 'failureConditions',
      label: 'failureConditions',
      default: [],
      readonly: false
    },
    onFailure: {
      name: 'onFailure',
      label: 'onFailure',
      default: [],
      readonly: false
    },
    active: null,
    done: null,
    failed: null,
    isFirstTask: null,
    isLastTask: null,
    formerTasks: null,
    nextTasks: null,
  }
}

