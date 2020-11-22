import { getBasicTypeDef, getPropDef } from './builtInData'

export const builtInTypes: TypesDefinitions = {
  'quest': {
    id: 'quest',
    name: 'Quest',
    definition: {
      ...getBasicTypeDef(),
      name: getPropDef('string', 'name', 0),
      prop2: getPropDef('int32', 'prop2', 1)
    }
  },
  'questNode': {
    id: 'questNode',
    name: 'QuestNode',
    definition: {
      ...getBasicTypeDef(),
      prop1: getPropDef('int32', 'prop1', 0),
    }
  },
  'dialog': {
    id: 'dialog',
    name: 'Dialog',
    definition: {
      ...getBasicTypeDef(),
      prop1: getPropDef('int32', 'prop1', 0),
    }
  },
  'dialogNode': {
    id: 'dialogNode',
    name: 'DialogNode',
    definition: {
      ...getBasicTypeDef(),
      prop1: getPropDef('int32', 'prop1', 0),
    }
  },
  'zone': {
    id: 'zone',
    name: 'Zone',
    definition: {
      ...getBasicTypeDef(),
      prop1: getPropDef('int32', 'prop1', 0),
    }
  },
  'interactable': {
    id: 'interactable',
    name: 'Interactable',
    definition: {
      ...getBasicTypeDef(),
      prop1: getPropDef('int32', 'prop1', 0),
    }
  },
}
