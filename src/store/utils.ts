/* Shallow */
export function validateProjectDataKeys(data: any) {
  return Object.keys(data).every((k) => Object.keys(getNewProjectTemplate()).some((dk) => dk === k))
}

export function getWorkspaceConfigurationDefaults() {
  const workspaceConfiguration: WorkspaceConfiguration = {
    modulus: 1,
    fitToTiles: false,
    lockScale: false,
    lockedScale: 1,
    lockView: false,
    lockedViewPosition: {},
    lockTiles: false,
    lastSessionCamera: null,
  }
  return workspaceConfiguration
}

export function getWorkspaceDefaults() {
  const workspace: Workspace = {
    id: `workspace_${Date.now()}${Math.random()}`,
    name: 'New Workspace',
    order: 1,
    configuration: {
      ...getWorkspaceConfigurationDefaults()
    }
  }
  return workspace
}

export function getNewProjectUiData() {
  const workspaceDefaults = getWorkspaceDefaults()
  const uiData: UiData = {
    workspaces: [{
      ...workspaceDefaults
    }],
    tiles: [],
    activeWorkspaceId: workspaceDefaults.id,
  }
  return uiData
}

export function getUniqueTypeName(state: ApplicationState) {
  let affix = 1
  const getNewName = () => 'NewType' + affix
  const isUnique = (n: string) => !Object.keys(state.project.types).some((tn) => tn === n)
  while (!isUnique(getNewName()) && affix < 1000) {
    affix++
  }
  return getNewName()
}

export function getUniquePropName(state: ApplicationState, typeName: string) {
  let affix = 1
  const getNewName = () => 'NewProp' + affix
  const isUnique = (n: string) => !Object.keys(state.project.types[typeName]).some((tn) => tn === n)
  while (!isUnique(getNewName()) && affix < 1000) {
    affix++
  }
  return getNewName()
}

export function getUniqueInstanceId(state: ApplicationState) {
  const getId = () => Date.now().toString().substring(3).substring(-1)
  const isUnique = (id: string) => {
    const types = state.project.types
    return !Object.keys(types).some((tn) => {
      const typeInstances = state.project.instances[tn]
      return Object.keys(typeInstances).some((tin) => {
        return typeInstances[tin].id.values[0] === id
      })
    })
  }
  let uid = getId()
  let i = 0
  while (!isUnique(uid) && i < 1000) {
    uid = getId()
    i++
  }
  return uid
}

export function getNewTypeData(): TypeDefinition {
  return {
    id: getTypeDefProp('int32', 'id'),
    meta_typeName: getTypeDefProp('string', 'meta_typeName'),
    meta_isBoundTo: getTypeDefProp('int32', 'meta_isBoundTo', true),
    meta_isReferencing: getTypeDefProp('int32', 'meta_isReferencing', true),
    meta_isReferencedBy: getTypeDefProp('int32', 'meta_isReferencedBy', true),
    meta_isLocked: getTypeDefProp('bool', 'meta_isLocked'),
  }
}

export function getInitialPropValues(propDef: PropDefinition) {
  if (propDef.valueType === 'int32') {
    if (propDef.isRef) {
      return []
    }
    return [0]
  }
  if (propDef.valueType === 'flt') return [0]
  if (propDef.valueType === 'string') return ['placeholder']
  return [false]
}

export function getNewInstanceData(state: ApplicationState, typeName: string, uid: string): TypeInstance {
  const instance = Object.entries(state.project.types[typeName]).reduce((acc, tuple) => {
    if (tuple[0] === 'id' || tuple[0] === 'meta_isBound' || tuple[0] === 'meta_typeName') {
      return acc
    }
    return {
      ...acc,
      [tuple[0]]: getInstanceProp(
        tuple[1].valueType, tuple[1].name, getInitialPropValues(tuple[1]), tuple[1].isArray
      ),
    }
  }, {})
  return {
    ...instance,
    id: getInstanceProp('int32', 'id', [uid]),
    meta_isBoundTo: getInstanceProp('int32', 'meta_isBound', [], true),
    meta_typeName: getInstanceProp('string', 'meta_typeName', [typeName]),
    meta_isReferencing: getInstanceProp('int32', 'meta_isReferencing', [], true),
    meta_isReferencedBy: getInstanceProp('int32', 'meta_isReferencedBy', [], true),
    meta_isLocked: getInstanceProp('bool', 'meta_isLocked', [false]),
  }
}

export function getInstanceProp(
  valueType: 'int32' | 'string' | 'flt' | 'bool', name: string, values: Array<number | string | boolean>, isArray?: boolean
): InstanceProp {
  return getProp(valueType, name, values, isArray) as InstanceProp;
}
export function getTypeDefProp(
  valueType: 'int32' | 'string' | 'flt' | 'bool', name: string, isArray?: boolean
): PropDefinition {
  return getProp(valueType, name, null, isArray);
}
export function getProp(
  valueType: 'int32' | 'string' | 'flt' | 'bool', name: string, values?: Array<number | string | boolean> | null, isArray?: boolean
): InstanceProp | PropDefinition {
  return {
    valueType,
    name,
    ...(values || []),
    ...(isArray ? { isArray } : {})
  }
}

export function getMockedTypesDefinitions(): TypesDefinitions {
  return {
    type1: {
      id: getTypeDefProp('int32', 'id'),
      meta_isBoundTo: getTypeDefProp('int32', 'meta_isBoundTo', true),
      meta_typeName: getTypeDefProp('string', 'meta_typeName'),
      meta_isReferencing: getTypeDefProp('int32', 'meta_isReferencing', true),
      meta_isReferencedBy: getTypeDefProp('int32', 'meta_isReferencedBy', true),
      meta_isLocked: getTypeDefProp('bool', 'meta_isLocked'),
      prop1: getTypeDefProp('int32', 'prop1'),
      prop2: getTypeDefProp('int32', 'prop2')
    },
    type2: {
      id: getTypeDefProp('int32', 'id'),
      meta_isBoundTo: getTypeDefProp('int32', 'meta_isBoundTo', true),
      meta_typeName: getTypeDefProp('string', 'meta_typeName'),
      meta_isReferencing: getTypeDefProp('int32', 'meta_isReferencing', true),
      meta_isReferencedBy: getTypeDefProp('int32', 'meta_isReferencedBy', true),
      meta_isLocked: getTypeDefProp('bool', 'meta_isLocked'),
      prop1: getTypeDefProp('int32', 'prop1'),
      prop2: getTypeDefProp('flt', 'prop2'),
      prop3: getTypeDefProp('string', 'prop3'),
      prop4: getTypeDefProp('bool', 'prop4'),
      prop5: getTypeDefProp('int32', 'prop5', true),
      prop6: getTypeDefProp('flt', 'prop6', true),
      prop7: getTypeDefProp('string', 'prop7', true),
      prop8: getTypeDefProp('bool', 'prop8', true),
    },
  }
}

export function getMockedTypeInstance(typeName: string, typeId: number, types?: TypesDefinitions): TypeInstance {
  const id = Date.now().toString().substring(3).substring(-1)
  const assignValues = (prop: PropDefinition): InstanceProp => {
    const getValues = (valueType: ValueType, isArray?: boolean) => {
      const getValue = (vT: ValueType) => {
        if (vT === 'int32') {
          if (prop.name === 'id') {
            return id
          } else if (prop.name === 'meta_typeId') {
            return typeId
          }
          return Math.round(Math.random() * 100)
        } else if (vT === 'flt') {
          return (Math.random() * 100).toFixed(5)
        } else if (vT === 'string') {
          const pieces = ['qe', 'ra', 'lok', 'nu', 've', 'zis', 'foc', 'wam', 'kud', 'ryx', 'kor'];
          const getWord = () => {
            return new Array(Math.round(Math.random() * 5)).map((t) => {
              t = pieces[Math.round(Math.random() * pieces.length)]
              return t
            }).join()
          }

          const getSentence = () => {
            return (new Array(Math.round(Math.random() * 7)).map((w, i) => {
              w = (i === 0
                ? getWord().split('').map((l, li) => ((li === 0) ? l.toUpperCase() : l))
                : getWord()) + (Math.random() < 0.2 ? ',' : '')
              return w
            }).join(' ') + '.')
          }

          return getSentence()
        }
        return Boolean(Math.round(Math.random()))
      }

      const length = isArray ? (Math.round(Math.random() * 4)) : 1;

      return Array(length).map(() => getValue(valueType)) as ValueType[]
    }

    return {
      valueType: prop.valueType,
      name: prop.name,
      ...(prop.isArray ? { isArray: true } : {}),
      values: getValues(prop.valueType, prop.isArray),
    }
  }

  const props = types ? types[typeName] : getMockedTypesDefinitions()[typeName]
  const TypeInstance: TypeInstance = Object.keys(props).reduce((acc, k) => {
    return {
      ...acc,
      [props[k].name]: assignValues(props[k])
    }
  }, {} as TypeInstance)

  return TypeInstance
}

export function getMockedInstances(): Instances {
  const getType = (typeName: string, typeId: number) => {
    const instance = getMockedTypeInstance(typeName, typeId)
    return {
      [(instance.id as InstanceProp).values[0] as number]: {
        ...instance
      }
    }
  }
  return {
    type1: {
      ...getType('type1', 0),
      ...getType('type1', 0),
      ...getType('type1', 0),
      ...getType('type1', 0)
    },
    type2: {
      ...getType('type2', 1),
      ...getType('type2', 1),
      ...getType('type2', 1),
      ...getType('type2', 1)
    },
  }
}

export function getNewProjectTemplate() {
  const project: Project = {
    instances: getMockedInstances(),
    types: getMockedTypesDefinitions(),
    uiData: {
      ...getNewProjectUiData()
    }
  }
  return project
}

export function copyType(source: TypeDefinition) {
  return Object.entries(source).reduce((acc, tuple1) => {
    acc[tuple1[0]] = {
      ...tuple1[1]
    }
    return acc
  }, {} as TypeDefinition)
}

export function copyInstance(source: TypeInstance) {
  return Object.entries(source).reduce((acc, tuple1) => {
    acc[tuple1[0]] = {
      ...tuple1[1],
      values: [
        ...tuple1[1].values
      ]
    }
    return acc
  }, {} as TypeInstance)
}
