const valueObject = {
  type: '',
  value: '',
  valueType: '',
  container: null,
}

const task = {
  id: {
    type: 'taskID',
    value: '1sadqqe123',
    valueType: 'string',
    // container <- no container
  },
  successConditions: {
    type: 'Work',
    value: [
      {
        id: {
          type: 'WorkID',
          value: '123asqw1235tas',
          valueType: 'string'
        },
        workType: {
          type: 'WorkType',
          value: 'WinBattle',
          valueType: 'string'
        },
        parameters: {
          type: 'WorkParameters',
          value: {
            param1: {
              // type <- no type
              value: 123,
              valueType: 'intiger',
            }
          },
          valueType: 'Object'
        }
      },
      {},
      {},
    ],
    valueType: 'object',
    container: 'array'
  },
}
/*
const taskSimplified: {
  id: 'taskID',
  successConditions: 'Work[]',
  // ...
}
 */

const types = {
  'Task': task
}
