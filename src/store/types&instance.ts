import { createStore } from 'vuex';
import * as utils from './utils';
import initialState from './state';
import { mutate, revertChange } from './transactions';

const registerInstancesMutation = (state: ApplicationState) => {
  state.projectInstancesMutated = true
}

const identity = <T>(payload: T) => payload
const typesAndInstances = identity as unknown as typeof createStore

export default typesAndInstances({
  state: initialState,
  getters: {
    types(state) {
      return utils.oToA(state.project.types)
    },
    getTypeById: (state) => (p: { tId: string }) => {
      const { tId } = p
      return state.project.types[tId]
    },
    getTypeByName: (state) => (p: { tN: string }) => {
      const { tN } = p
      return (Object.entries(state.project.types).find(([, wrapper]) => wrapper.name === tN) || [null])[0]
    },
    getTypeByInstance: (state) => (p: { iId: string }) => {
      const { iId } = p
      return utils.oToA(state.project.types).find((tw) => iId in state.project.instances[tw.id])
    },
    getType: (state, getters) => (p: { tId: string, tN: string, iId: string }) => {
      const { tId, tN, iId } = p
      if (tId) return getters.getTypeById({ tId })
      if (tN) return getters.getTypeByName({ tN })
      if (iId) return getters.getTypeByInstance({ iId })
      return null
    },
    getTypeId: (state, getters) => (p: { tN: string, iId: string }) => {
      const { tN, iId } = p
      if (tN) return getters.getTypeByName({ tN })?.id
      if (iId) return getters.getTypeByInstance({ iId })?.id
      return null
    },
    getTypeDefinition: (state, getters) => (p: { tId: string, tN: string, iId: string }) => {
      return getters.getType(p)?.definition
    },
    getTypeName: (state, getters) => (p: { tId: string, iId: string }) => {
      return (getters.getType(p) as TypeWrapper).name
    },
    getPDef: (state, getters) => (p: { tId: string, tN: string, iId: string, pN: string }) => {
      const { pN } = p
      return getters.getType(p)?.definition[pN]
    },
    getPV: (state, getters) => (p: { tId: string, iId: string, pN: string }) => {
      const { tId, iId, pN } = p
      return [...((getters.getInstance({ tId, iId }) as Instance)[pN] || [])]
    },
    getInstanceByTypeId: (state) => (p: { tId: string, iId: string }) => {
      const { tId, iId } = p
      return state.project.instances[tId][iId]
    },
    getInstanceByTypeName: (state, getters) => (p: { tN: string, iId: string }) => {
      const { tN, iId } = p
      return getters.getInstanceByTypeId({ tId: getters.getType({ tN }).id, iId })
    },
    getInstance: (state, getters) => (p: { tId: string, tN: string, iId: string }) => {
      const { tId, tN, iId } = p

      if (tId) return getters.getInstanceByTypeId({ tId, iId })
      if (tN) return getters.getInstanceByTypeName({ tN, iId })
      if (iId) {
        const instance: Instance[] = []
        Object.entries(state.project.instances).some(([, iL]) => {
          return iId in iL && instance.push(iL[iId])
        })
        return instance[0]
      }
      return null
    },
    getPropTarget: (state, getters) => (p: { tId: string, iId: string, pN: string }) => {
      const { pN } = p
      const type = getters.getType(p)
      return type.definition[pN].refTargetTypeId
    },
    getInstancesListOfType: (state, getters) => (p: { tId: string, tN: string, iId: string }) => {
      const { tId } = p
      if (tId) return state.project.instances[tId]
      return state.project.instances[(getters.getType(p) as TypeWrapper).id]
    },
    getInstancesWithEmptyValues: (state) => {
      const instances: { instanceId: string, typeId: string }[] = []

      Object.entries(state.project.instances).forEach(([typeId, instanceList]) => { // for each type instance
        Object.entries(instanceList).forEach(([instanceId, instance]) => {
          Object.entries(instance).forEach(([propName, values]) => {
            if (!propName.includes('meta') || propName !== 'id') {
              if (!values.length) {
                instances.push({
                  instanceId,
                  typeId
                })
              }
            }
          })
        })
      })

      return instances
    },
    getAllTypeIdsReferencingType: (state) => (p: { tId: string }) => {
      const { tId } = p
      const types = state.project.types
      return Object.entries(types).reduce((acc, [_tId]) => {
        return Object.entries(types[_tId].definition).some(([, prop]) => {
          return prop.refTargetTypeId === tId
        }) ? [...acc, _tId] : acc
      }, [] as string[])
    },
    getAllInstancesFromTypeIds: (state, getters) => (typeIds: string[]) => {
      return typeIds.reduce((acc, tId) => {
        return [...acc, getters.getAllInstancesOfType({ typeId: tId })]
      }, [] as Instance[])
    },
    isPropARef: (state, getters) => (tId: string, pN: string) => {
      return (getters.getType({ typeId: tId }) as TypeWrapper).definition[pN].valueType === 'ref'
    },
    isPropArray: (state, getters) => (p: { tId: string, pN: string }) => {
      const { tId, pN } = p
      return (getters.getType({ typeId: tId }) as TypeWrapper).definition[pN].isArray
    },
    getPropValues: (state, getters) => (p: { tId: string, iId: string, pN: string }) => {
      const { iId, pN } = p
      return (getters.instance({ iId }) as Instance)[pN]
    },
    getFilteredInstances: (state, getters) => (
      p: { iId: string, tN: string, tId: string,
        prop: { pN: string, pV: string | number | boolean },
        isReferencedByInstance: string, isReferencingInstance: string,
        isReferencedByType: string, isReferencingType: string,
      }
    ): Instance[] => {
      let instancesIds: string[] = Object.entries(state.project.instances).reduce((acc, [, iL]) => {
        return [...acc, ...Object.entries(iL).map(([iId]) => iId)]
      }, [] as string[])

      const { tId, tN, iId, prop, isReferencedByInstance, isReferencingInstance, isReferencedByType, isReferencingType } = p

      if (iId) {
        instancesIds = instancesIds.filter((instanceId) => iId === instanceId)
      }
      if (tN || tId) {
        const iL = getters.getInstancesListOfType({ tId, tN }) as InstanceList
        instancesIds = instancesIds.filter((instanceId) => Object.entries(iL).some(([_iId]) => instanceId === _iId))
      }
      if (prop.pN || prop.pV) {
        const { pN, pV } = prop
        const matchByProp = (_iId: string) => {
          const instance = getters.getInstance({ iId: _iId }) as Instance
          if (pV !== undefined) {
            return Object.entries(instance).some(([pName, pValues]) => pName === pN && pValues.some((v) => v === pV))
          } else {
            // This is low performance approach. Fix it by looking by type definitions first
            // and then by filtering instances based on matching types.
            console.log('check')
            return Object.entries(instance).some(([pName]) => pName === pN)
          }
        }
        instancesIds = instancesIds.filter(matchByProp)
      }
      // Get all referenced by given instance
      if (isReferencedByInstance) {
        // The instance that is referencing other we look for
        const instance = getters.getInstance({ iId: isReferencedByInstance }) as Instance
        // We conveniently have all that data in meta field
        instancesIds = instancesIds.filter((_iId) => instance.meta_isReferencing.some((instanceId) => _iId === instanceId))
      }
      // Get all instances that reference specific instance
      if (isReferencingInstance) {
        // The instance that is referenced by other we look for
        const instance = getters.getInstance({ iId: isReferencingInstance }) as Instance
        // And again all conveniently is already in meta
        instancesIds = instancesIds.filter((_iId) => instance.meta_isReferencedBy.some((instanceId) => _iId === instanceId))
      }
      if (isReferencedByType) {
        const type = getters.getType({ tId: isReferencedByType }) as TypeWrapper
        const targetTypes = Object.entries(type.definition).reduce((acc, [, pDef]) => {
          if (pDef.refTargetTypeId) {
            acc.pushUnique(pDef.refTargetTypeId)
          }
          return acc
        }, [] as string[])
        instancesIds = instancesIds.filter((_iId) => targetTypes.some((_tId) => _iId in state.project.instances[_tId]))
      }
      if (isReferencingType) {
        const referencingTypes: string[] = getters.getAllTypeIdsReferencingType({ tId: isReferencingType })
        instancesIds = instancesIds.filter((_iId) => referencingTypes.some((_tId) => _iId in state.project.instances[_tId]))
      }
      // Get actual instances
      return Object.entries(state.project.instances).reduce((acc, [, iL]) => {
        return [
          ...acc,
          ...(Object.entries(iL)).reduce((_acc, [_iId]) => {
            if (instancesIds.includes(_iId)) {
              instancesIds.remove(_iId)
              return [..._acc, iL[_iId]]
            }
            return _acc
          }, [] as Instance[])
        ]
      }, [] as Instance[])
    },
    /**
     * Get all props of type A that reference type B
     */
    getPropsOfTypeAWithRefToTypeB: (state, getters) => (
      p: { tAId?: string, tBId?: string, iAId?: string, iBId?: string, tA?: TypeWrapper, tB?: TypeWrapper }
    ) => {
      const { tAId, iAId, iBId } = p
      let { tBId, tA, tB } = p
      tA = tA || getters.getType({ typeId: tAId }, iAId) as TypeWrapper
      tB = tB || getters.getType({ typeId: tBId }, iBId) as TypeWrapper
      tBId = tBId || tB.id
      const propNames: string[] = []
      Object.entries(tA.definition).forEach(([, prop]) => {
        if (prop.refTargetTypeId === tBId) {
          propNames.push(prop.name)
        }
      })
      return propNames
    },
    recentChanges: (state) => {
      return state.project.recentChanges
    },
    getIsTypeNameUnique: (state) => (name: string) => {
      return !Object.entries(state.project.types).some(([, tw]) => tw.name === name)
    }
  },
  mutations: {
    OPEN_TRANSACTION(state, actionType: ActionType) {
      if (state.currentTransaction) return
      state.currentTransaction = {
        actionType,
        changes: []
      }
    },
    CLOSE_TRANSACTION(state) {
      if (!state.currentTransaction) return
      state.project.recentChanges.push({
        ...state.currentTransaction
      })
      state.currentTransaction = null
    },
    REVERT_LAST_CHANGE(state) {
      const lastTransaction = state.project.recentChanges.pop()
      if (!lastTransaction) return
      while (lastTransaction.changes.length) {
        const changeToRevert = lastTransaction.changes.pop() as Change
        revertChange(changeToRevert)
      }
    },
    CREATE_TYPE(state, p: { tId: string }) { // OK
      const { tId } = p
      registerInstancesMutation(state)

      const uniqueName = utils.getUniqueTypeName(state)

      state.project.types[tId] = {
        name: uniqueName,
        id: tId,
        definition: utils.getNewTypeData()
      }
      state.project.instances[tId] = {}
    },
    RENAME_TYPE(state, p: { tId: string, newName: string }) { // OK
      registerInstancesMutation(state)
      const { tId, newName } = p

      const type = state.project.types[tId]
      type.name = newName
    },
    REMOVE_TYPE(state, p: { tId: string }) { // OK
      const { tId } = p
      registerInstancesMutation(state)

      delete state.project.types[tId]
      // At this point all instance are removed
      delete state.project.instances[tId]
    },
    CREATE_PROP(state, p: { tId: string, prop: PropDefinition }) { // OK
      const { tId, prop } = p
      registerInstancesMutation(state)

      // Prop is added to all existing instances in separate step
      state.project.types[tId].definition[prop.name] = prop
    },
    REMOVE_PROP(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p
      registerInstancesMutation(state)

      // At this point prop is already removed from all instances
      delete state.project.types[tId].definition[pN]
    },
    RENAME_PROP(state, p: { tId: string, pN: string, newName: string }) { // OK
      const { tId, pN, newName } = p
      registerInstancesMutation(state)

      state.project.types[tId].definition[pN].name = newName
      state.project.types[tId].definition[newName] = state.project.types[tId].definition[pN]
      delete state.project.types[tId].definition[pN]
    },
    CHANGE_PROP_VALUE_TYPE(state, p: { tId: string, pN: string, newType: ValueType }) { // OK
      const { tId, pN, newType } = p
      registerInstancesMutation(state)

      // If it was ref before remove it's target Id.
      // If it becomes ref the target will be set in separate action.
      if (state.project.types[tId].definition[pN].valueType === 'ref') {
        state.project.types[tId].definition[pN].refTargetTypeId = ''
      }

      // At this point type is already changed in all instances
      state.project.types[tId].definition[pN].valueType = newType
    },
    CHANGE_PROP_ARITY(state, p: { tId: string, pN: string, isArray: boolean }) { // OK
      const { tId, pN, isArray } = p
      registerInstancesMutation(state)

      // At this point arity is already changed in all instances
      state.project.types[tId].definition[pN].isArray = isArray
    },
    CHANGE_PROP_REF_TARGET_TYPE(state, p: { tId: string, pN: string, newTargetId: string }) { // OK
      const { tId, pN, newTargetId } = p
      registerInstancesMutation(state)

      // At this point all instances refs business is resolved
      state.project.types[tId].definition[pN].refTargetTypeId = newTargetId
    },
    CHANGE_PROP_VALUE(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
      registerInstancesMutation(state)

      // At this point all instances refs business is resolved
      state.project.instances[tId][iId][pN] = value
    },
    ADD_PROP_VALUE(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
      registerInstancesMutation(state)

      // At this point all instances refs business is resolved
      state.project.instances[tId][iId][pN].pushUnique(value[0])
    },
    REMOVE_PROP_VALUE(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
      registerInstancesMutation(state)

      // At this point all instances refs business is resolved
      state.project.instances[tId][iId][pN].remove(value[0])
    },
    CREATE_INSTANCE(state, p: { tId: string, iId: string, tN: string, }) { // Ok
      const { tId, iId, tN } = p
      registerInstancesMutation(state)

      state.project.instances[tId][iId] = utils.getNewInstanceData(state, tN, iId)
    },
    REMOVE_INSTANCE(state, p: { tId: string, iId: string }) { // OK
      const { tId, iId } = p
      registerInstancesMutation(state)

      delete state.project.instances[tId][iId]
    },
    REMOVE_INSTANCE_PROP(state, p: { tId: string, iId: string, pN: string }) { // OK
      const { tId, iId, pN } = p
      registerInstancesMutation(state)

      delete state.project.instances[tId][iId][pN]
    },
    RENAME_INSTANCE_PROP(state, p: { tId: string, iId: string, pN: string, newName: string }) { // OK
      const { tId, iId, pN, newName } = p
      registerInstancesMutation(state)

      state.project.instances[tId][iId][newName] = state.project.instances[tId][iId][pN]
      delete state.project.instances[tId][iId][pN]
    },
    UPDATE_REF_META_FROM_A_TO_B(state, p: { iA: Instance, iB: Instance, propsToCheck: string[] }) {
      const { iA, iB, propsToCheck } = p
      const iAId = iA.id[0]
      const iBId = iB.id[0]

      const aReferencesB = propsToCheck.some((propName) => {
        return iA[propName].includes(iBId)
      })

      if (aReferencesB) {
        iA.meta_isReferencing.pushUnique(iBId)
        iB.meta_isReferencedBy.pushUnique(iAId)
      } else {
        iA.meta_isReferencing.remove(iBId)
        iB.meta_isReferencedBy.remove(iAId)
      }
    },
  },
  actions: {
    publicAction(state, p: { actionType: ActionType, context: PublicActionContext }) {
      const { actionType, context } = p
      this.dispatch('openTransaction', actionType)
      this.dispatch(actionType, context)
      this.dispatch('closeTransaction', actionType)
    },
    openTransaction(state, actionType: ActionType) {
      state.commit('OPEN_TRANSACTION', actionType)
    },
    closeTransaction(state) {
      state.commit('CLOSE_TRANSACTION')
    },
    /* =====================================================================
     *
     *                    PUBLIC ACTIONS START
     *
     *====================================================================== */
    createType(state) { // OK
      const tId = utils.getUniqueId(state.state)
      mutate('CREATE_TYPE', {}, 'TypeWrapper', tId)
    },
    removeType(state, p: { tId: string }) { // OK
      const { tId } = p
      Object.entries(state.state.project.instances[tId]).forEach(([iId]) => {
        this.dispatch('removeInstance', { tId, iId })
      })

      // Tell propDefs in other types that this type is no longer available
      Object.entries(state.state.project.types).forEach(([typeId, wrapper]) => {
        if (typeId === tId) return

        state.getters.getPropsOfTypeAWithRefToTypeB({ tAId: wrapper.id, tBId: tId })
          .forEach((pN: string) => {
            //  This is slightly inefficient since it will also update metadata
            // about references for the type we are about to remove.
            //  I assume that empty string will make sense - if handled properly it will yield
            // no instances available to ref
            this.dispatch('changePropTargetType', { tId, pN, newTargetId: '' })
          })
      })

      mutate('REMOVE_TYPE', {}, 'TypeWrapper', tId)
    },
    renameType(state, p: { tId: string, newName: string }) { // OK
      const { tId, newName } = p

      mutate('RENAME_TYPE', { newName }, 'TypeWrapper', tId)
    },
    createProp(state, p: { tId: string }) { // OK
      const { tId } = p
      const uniquePropName = utils.getUniquePropName(state.state, tId)
      const prop = utils.getPropDef('int32', uniquePropName)
      mutate('CREATE_PROP', { prop }, 'PropDefinition', tId)

      Object.entries(state.state.project.instances[tId]).forEach(([iId]) => {
        this.dispatch('addPropToInstance', { tId, iId, prop })
      })
    },
    removeProp(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p

      this.dispatch('removeAllRefsFromEveryPropA', p)

      // Need to also remove prop from every single Instance
      Object.entries(state.state.project.instances[tId]).forEach(([iId]) => {
        this.dispatch('removePropFromInstance', { tId, iId, pN })
      })

      mutate('REMOVE_PROP', {}, 'PropDefinition', tId, '', pN)
    },
    renameProp(state, p: { tId: string, pN: string, newName: string }) { // OK
      const { tId, pN, newName } = p

      Object.entries(state.state.project.instances[tId]).forEach(([iId]) => {
        this.dispatch('renameInstanceProp', { tId, iId, pN, newName })
      })

      mutate('RENAME_PROP', { newName }, 'PropDefinition', tId, '', pN)
    },
    changePropType(state, p: { tId: string, pN: string, newType: ValueType }) { // OK
      const { tId, pN, newType } = p
      const isRef = state.getters.isPropARef(tId, pN)

      if (isRef) {
        this.dispatch('changePropTypeFromRef', p)
        return
      } else if (newType === 'ref') {
        this.dispatch('changePropTypeToRef', p)
        return
      }

      mutate('CHANGE_PROP_VALUE_TYPE', { newType }, 'PropDefinition', tId, '', pN)
    },
    changePropToArray(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p

      mutate('CHANGE_PROP_ARITY', { isArray: true }, 'PropDefinition', tId, '', pN)
    },
    changePropToSingle(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p
      const isRef = state.getters.isPropARef(tId, pN)

      // Remove values from prop in all instances.
      Object.entries(state.state.project.instances[tId]).forEach(([, instance]) => {
        const valuesToRemove = instance[pN].splice(1) // all but first (change in place)
        if (isRef) {
          // And in case of ref we will do special stuff ofc.
          valuesToRemove.forEach((v) => this.dispatch('removePropRefValue', { tId, pN, value: v }))
        } else {
          valuesToRemove.forEach((v) => this.dispatch('removePropValue', { tId, pN, value: v }))
        }
      })

      mutate('CHANGE_PROP_ARITY', { isArray: false }, 'PropDefinition', tId, '', pN)
    },
    changePropTargetType(state, p: { tId: string, pN: string, newTargetId: string }) { // OK
      const { tId, pN, newTargetId } = p

      // Removing values from all instances with this prop.
      // Meta is also cleaned-up.
      utils.oToA(state.state.project.instances[tId]).forEach((instance) => {
        instance[pN].forEach((v) => {
          this.dispatch('removePropRefValue', { tId, pN, value: v })
        })
      })

      mutate('CHANGE_PROP_REF_TARGET_TYPE', { newTargetId }, 'PropDefinition', tId, '', pN)
    },
    changePropValue(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const isArray = state.getters.isPropArray(p)
      if (isArray) {
        console.error('Tried to change value in array property instead of adding new.')
        this.dispatch('addPropValue', p)
      }

      const currentValues = state.getters.getPropValues(p)

      if (currentValues.length > 1) {
        Error('Non array property helds more that a single value.')
        return
      }

      this.dispatch('removePropValue', { ...p, value: currentValues[0] })
      this.dispatch('addPropValue', { ...p })
    },
    addPropValue(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
      const isArray = state.getters.isPropArray(tId, pN)
      if (!isArray) {
        console.error('Tried to add value to non-array property instead of changing existing.')
        this.dispatch('changePropValue', p)
        return
      }

      const isRef = state.getters.isPropARef(tId, pN)

      if (isRef) {
        this.dispatch('addPropRefValue', p)
      } else {
        mutate('ADD_PROP_VALUE', { value }, 'PropValues', tId, iId, pN)
      }
    },
    removePropValue(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
      const isRef = state.getters.isPropARef(tId, pN)

      if (isRef) {
        this.dispatch('removePropRefValue', p)
      } else {
        mutate('REMOVE_PROP_VALUE', { value }, 'PropValues', tId, iId, pN)
      }
    },
    createInstance(state, p: { tId: string }) { // OK
      const { tId } = p
      const iId = utils.getUniqueId(state.state)
      const tN = state.getters.getTypeName({ typeId: tId })

      mutate('CREATE_INSTANCE', { tN }, 'Instance', tId, iId)
    },
    removeInstance(state, p: { tId: string, iId: string }) { // OK
      const { tId, iId } = p

      this.dispatch('removeAllRefsFromInstA', { iId })
      this.dispatch('removeAllRefsToInstA', { iId })

      mutate('REMOVE_INSTANCE', {}, 'Instance', tId, iId)
    },
    /* =====================================================================
     *
     *                    PUBLIC ACTIONS END
     *
     *====================================================================== */

    addPropRefValue(state, p: { tId: string, pN: string, value: Values }) { // OK
      const { tId, pN, value } = p

      mutate('ADD_PROP_VALUE', { value }, 'PropValues', tId, '', pN)

      const iA = state.getters.getInstance({ typeId: tId })
      const iB = state.getters.getInstance(value)

      this.dispatch('updateMetaOfRefsFromInstAToInstB', { iA, iB })
    },
    removePropRefValue(state, p: { tId: string, pN: string, value: Values }) { // OK
      const { tId, pN, value } = p

      mutate('REMOVE_PROP_VALUE', { value }, 'PropValues', tId, '', pN)

      const iA = state.getters.getInstance({ typeId: tId })
      const iB = state.getters.getInstance(value)

      this.dispatch('updateMetaOfRefsFromInstAToInstB', { iA, iB })
    },

    removeAllRefsFromInstAtoInstB(state, p: { aIId: string, bIId: string }) { // OK
      const { aIId, bIId } = p
      const tId = state.getters.getType({}, aIId)

      const props = state.getters.getPropsOfTypeAWithRefToTypeB({ iAId: aIId, iBId: bIId })

      props.forEach((pN: string) => {
        this.dispatch('removePropRefValue', { tId, pN, value: bIId })
      })
    },
    removeAllRefsFromInstA(state, p: { iId: string }) { // OK
      const { iId } = p
      const type: TypeWrapper = state.getters.getType({ instanceId: iId })

      const referencedInstances = state.state.project.instances[type.id][iId].meta_isReferencing

      referencedInstances.forEach((bIId) => {
        this.dispatch('removeAllRefsFromInstAtoInstB', { aIId: iId, bIId })
      })
    },
    removeAllRefsToInstA(state, p: { iId: string }) { // OK
      const { iId } = p
      const type: TypeWrapper = state.getters.getType({ instanceId: iId })

      const referencingInstances = state.state.project.instances[type.id][iId].meta_isReferencedBy

      referencingInstances.forEach((bId) => {
        this.dispatch('removeAllRefsFromInstAtoInstB', { aIId: bId, bIId: iId })
      })
    },

    removeAllRefsFromEveryPropA(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p

      utils.oToA(state.state.project.instances[tId]).forEach((instance) => {
        instance[pN].forEach((v) => {
          this.dispatch('removePropRefValue', { tId, pN, value: v })
        })
      })
    },

    updateMetaOfRefsFromInstAToInstB(state, p: { iA: Instance, iB: Instance }) { // OK
      const { iA, iB } = p
      const propsToCheck = state.getters.getPropsOfTypeAWithRefToTypeB({ iAId: iA.id[0], iBId: iB.id[0] })
      const tId = state.getters.getType({}, iA.id[0])
      // This is so far an exception - a mutation that makes changes to more than one (here exactly two)
      // entities.
      // For now I'll handle it in a dirty way.
      // If multiple entities mutation case will be more prevalent I can change 'mutate'.
      mutate(null, {}, 'Instance', tId, iA.id[0])
      mutate(null, {}, 'Instance', tId, iB.id[0])
      this.commit('UPDATE_REF_META_FROM_A_TO_B', { iA, iB, propsToCheck })
    },

    addPropToInstance(state, p: { tId: string, iId: string, prop: PropDefinition }) { // OK
      const { tId, iId, prop } = p
      mutate('ADD_PROP_TO_INSTANCE', { prop }, 'Instance', tId, iId)
    },

    changePropValuesData(state, p: { tId: string, iId: string, pN: string, newName?: string, newType?: ValueType, isArray?: boolean }) { // OK
      const { tId, iId, pN, newName, newType, isArray } = p
      mutate('CHANGE_INSTANCE_PROP_DATA', { newName, newType, isArray }, 'PropValues', tId, iId, pN)
    },

    removePropFromInstance(state, p: { tId: string, iId: string, pN: string }) { // OK
      const { tId, iId, pN } = p
      mutate('REMOVE_INSTANCE_PROP', {}, 'PropValues', tId, iId, pN)
    },

    renameInstanceProp(state, p: { tId: string, iId: string, pN: string, newName: string }) { // OK
      const { tId, iId, pN, newName } = p
      mutate('RENAME_INSTANCE_PROP', { newName }, 'PropValues', tId, iId, pN)
    },

    changePropTypeToRef(state, p: { tId: string, pN: string }) { // OK
      const { tId } = p
      let { pN } = p

      // In c++ we rely on convention that all referencing props start with _ref
      if (pN.startsWith('ref_')) {
        this.dispatch('renameProp', { tId, pN, newName: ('ref_' + pN) })
        pN = 'ref_' + pN
      }

      // For this prop in all instance
      Object.entries(state.state.project.instances[tId]).forEach(([, instance]) => {
        // Remove all values
        const valuesToRemove = instance[pN]
        valuesToRemove.forEach((v) => this.dispatch('removePropValue', { tId, pN, value: v }))
      })

      mutate('CHANGE_PROP_VALUE_TYPE', { newType: 'ref' }, 'PropDefinition', tId, '', pN)
    },
    changePropTypeFromRef(state, p: { tId: string, pN: string, newType: ValueType }) { // OK
      const { tId, newType } = p
      let { pN } = p

      // In c++ we rely on convention that all referencing props start with _ref
      if (pN.startsWith('ref_')) {
        this.dispatch('renameProp', { tId, pN, newName: pN.replace('ref_', '') })
        pN = pN.replace('ref_', '')
      }

      // For this prop in all instance
      Object.entries(state.state.project.instances[tId]).forEach(([, instance]) => {
        // Remove all values
        const valuesToRemove = instance[pN]
        valuesToRemove.forEach((v) => this.dispatch('removePropRefValue', { tId, pN, value: v }))
      })

      mutate('CHANGE_PROP_VALUE_TYPE', { newType }, 'PropDefinition', tId, '', pN)
    },

    revertLastChange() {
      this.commit('REVERT_LAST_CHANGE')
    },

    // moveTypePropUp(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
    //   this.commit('MOVE_TYPE_PROP_UP', payload)
    // },
    // moveTypePropDown(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
    //   this.commit('MOVE_TYPE_PROP_DOWN', payload)
    // },
  },
});
