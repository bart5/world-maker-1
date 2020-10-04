/**
 * This file keeps template for proper forms display
 * of all game related objects.
 */

type StaticDataTemplate = {
  quest: FormTemplate<Quest>,
}

enum InputType {}

type FormTemplate<T extends {}> = {
  [k in keyof T]: {
    name: string;
    label?: string;
    default: any;
    inputType?: InputType;
    readonly: boolean;
    tooltip?: string;
  } | 'internal'
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
      label: 'questId',
      default: '0',
      readonly: false
    },
    firstTask: 'internal',
    active: 'internal',
    done: 'internal',
    failed: 'internal',
    obsolete: 'internal',
  }
}

