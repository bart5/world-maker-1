/**
 * This file manages staticData in context of WorldMaker.
 * It loads game data from staticData and saves it there
 * when it's edited, added or deleted.
 */

interface QuestStore {
  [questId: string]: Quest
}

interface TaskStore {
  [questId: string]: {
    [taskId: string]: Task
  }
}

const quests: {
  [questId: string]: Quest
} = {
  '1': {
    id: '1',
    name: 'Test quest 1',
    firstTask: '1',
    active: true,
    done: false,
    failed: false,
    obsolete: false,
  }
}

const tasks: {
  [Key in keyof typeof quests]: {
    [taskId: string]: Task
  }
} = {
  '1': {
    '1': {
      id: '1',
      name: 'Test task 1',
      questId: '1',
      successConditions: [],
      onSuccess: [],
      failureConditions: [],
      onFailure: [],
      active: true,
      done: false,
      failed: false,
      isFirstTask: true,
      isLastTask: false,
      formerTask: null,
      nextTasks: ['2', '3'],
    },
    '2': {
      id: '2',
      name: 'Test task 2',
      questId: '1',
      successConditions: [],
      onSuccess: [],
      failureConditions: [],
      onFailure: [],
      active: false,
      done: false,
      failed: false,
      isFirstTask: false,
      isLastTask: true,
      formerTask: '1',
      nextTasks: null,
    },
    '3': {
      id: '3',
      name: 'Test task 3',
      questId: '1',
      successConditions: [],
      onSuccess: [],
      failureConditions: [],
      onFailure: [],
      active: false,
      done: false,
      failed: false,
      isFirstTask: false,
      isLastTask: true,
      formerTask: '1',
      nextTasks: null,
    }
  }
}

export default {
  quests,
  tasks
}
