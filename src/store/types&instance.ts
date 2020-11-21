import { createStore } from 'vuex';
import * as utils from './utils';
import initialState from './state';
import { mutate } from './transactions';

const identity = <T>(payload: T) => payload
const typesAndInstances = identity as unknown as typeof createStore

export default typesAndInstances({
  state: initialState,
  getters: {
    types(state): TypeWrapper [] {
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
            if (!propName.startsWith('meta') || propName !== 'id') {
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
    // getAllInstancesFromTypeIds: (state, getters) => (typeIds: string[]) => {
    //   return typeIds.reduce((acc, tId) => {
    //     return [...acc, getters.getAllInstancesOfType({ typeId: tId })]
    //   }, [] as Instance[])
    // },
    isPropARef: (state, getters) => (tId: string, pN: string) => {
      return (getters.getType({ tId }) as TypeWrapper).definition[pN].valueType === 'ref'
    },
    isPropArray: (state, getters) => (p: { tId: string, pN: string }) => {
      const { tId, pN } = p
      return (getters.getType({ tId }) as TypeWrapper).definition[pN].isArray
    },
    getPropValues: (state, getters) => (p: { iId: string, pN: string }) => {
      const { iId, pN } = p
      return (getters.instance({ iId }) as Instance)[pN]
    },
    // Without Id and meta
    getPropsCount: (state, getters) => (p: { tId: string }) => {
      const { tId } = p
      const type: TypeWrapper = getters.getType({ tId })
      return utils.oToA(type.definition).filter((pDef) => {
        return !(pDef.name.startsWith('meta') || pDef.name === 'id')
      }).length
    },
    getFilteredInstances: (state, getters) => (
      p: { iId: string, tN: string, tId: string,
        prop: { pN: string, pV: string | number | boolean },
        isReferencedByInstance: string, isReferencingInstance: string,
        referencingProp: string,
        isReferencedByType: string, isReferencingType: string,
        isBound: boolean, isNotBound: boolean, isBoundTo: string
      }
    ): Instance[] => {
      let instancesIds: string[] = Object.entries(state.project.instances).reduce((acc, [, iL]) => {
        return [...acc, ...Object.entries(iL).map(([iId]) => iId)]
      }, [] as string[])

      const { tId, tN, iId, prop, isReferencedByInstance, isReferencingInstance, referencingProp,
        isReferencedByType, isReferencingType, isBound, isNotBound, isBoundTo } = p

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
            return Object.entries(instance).some(([pName]) => pName === pN)
          }
        }
        instancesIds = instancesIds.filter(matchByProp)
      }
      // Get all referenced by given instance
      if (isReferencedByInstance) {
        // Get all referenced by specific prop in instance
        if (referencingProp) {
          const instance = getters.getInstance({ iId: isReferencedByInstance }) as Instance
          instancesIds = instancesIds.filter((_iId) => instance[referencingProp].some((v) => _iId === v))
        } else {
          // The instance that is referencing other we look for
          const instance = getters.getInstance({ iId: isReferencedByInstance }) as Instance
          // We conveniently have all that data in meta field
          instancesIds = instancesIds.filter((_iId) => instance.meta_isReferencing.some((instanceId) => _iId === instanceId))
        }
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
      if (isBound) {
        instancesIds = instancesIds.filter((_iId) => {
          const instance: Instance = getters.getInstance({ iId: _iId })
          return instance.meta_isBoundTo.length > 0
        })
      }
      if (isNotBound) {
        instancesIds = instancesIds.filter((_iId) => {
          const instance: Instance = getters.getInstance({ iId: _iId })
          return instance.meta_isBoundTo.length === 0
        })
      }
      if (isBoundTo) {
        instancesIds = instancesIds.filter((_iId) => {
          const instance: Instance = getters.getInstance({ iId: _iId })
          return instance.meta_isBoundTo.includes(isBoundTo)
        })
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
    getFilteredTypes: (state, getters) => (
      p: { iId: string, tId: string,
        prop: { pN: string },
        isReferencedByInstance: string, isReferencingInstance: string,
        isReferencedByType: string, isReferencingType: string,
        isBound: boolean, isNotBound: boolean, isBoundTo: string
      }
    ): TypeWrapper[] => {
      const { tId, iId, prop, isReferencedByInstance, isReferencingInstance, isReferencedByType,
        isReferencingType, isBound, isNotBound, isBoundTo } = p

      let types: TypeWrapper[] = getters.types

      if (iId) {
        types = types.filter((wrapper) => iId in state.project.instances[wrapper.id])
      }
      if (tId) {
        types = types.filter((wrapper) => wrapper.id === tId)
      }
      if (prop?.pN) {
        const { pN } = prop
        types = types.filter((wrapper) => pN in wrapper.definition)
      }
      // Get all referenced by given instance
      if (isReferencedByInstance) {
        const type = getters.getType({ iId: isReferencedByInstance }) as TypeWrapper
        const targetTypes = Object.entries(type.definition).reduce((acc, [, pDef]) => {
          if (pDef.refTargetTypeId) {
            acc.pushUnique(pDef.refTargetTypeId)
          }
          return acc
        }, [] as string[])
        types = types.filter((wrapper) => targetTypes.some((_tId) => wrapper.id === _tId))
      }
      // Get types with instances referencing this instance
      if (isReferencingInstance) {
        const instances: Instance[] = getters.getFilteredInstances({ isReferencingInstance })
        types = types.filter((wrapper) => instances.some((i) => i.id[0] in state.project.instances[wrapper.id]))
      }
      if (isReferencedByType) {
        const type = getters.getType({ tId: isReferencedByType }) as TypeWrapper
        const targetTypes = Object.entries(type.definition).reduce((acc, [, pDef]) => {
          if (pDef.refTargetTypeId) {
            acc.pushUnique(pDef.refTargetTypeId)
          }
          return acc
        }, [] as string[])
        types = types.filter((wrapper) => targetTypes.some((_tId) => wrapper.id === _tId))
      }
      if (isReferencingType) {
        const referencingTypes: string[] = getters.getAllTypeIdsReferencingType({ tId: isReferencingType })
        types = types.filter((wrapper) => referencingTypes.some((_tId) => wrapper.id === _tId))
      }
      if (isBound || isNotBound || isBoundTo) {
        const instances: Instance[] = getters.getFilteredInstances({ isBound, isNotBound, isBoundTo })
        types = types.filter((wrapper) => instances.some((i) => i.id[0] in state.project.instances[wrapper.id]))
      }
      return types
    },
    /**
     * Get all props of type A that reference type B
     */
    getPropsOfTypeAWithRefToTypeB: (state, getters) => (
      p: { tAId?: string, tBId?: string, iAId?: string, iBId?: string, tA?: TypeWrapper, tB?: TypeWrapper }
    ): string[] => {
      const { tAId, iAId, iBId } = p
      let { tBId, tA, tB } = p
      tA = tA || getters.getType({ tId: tAId }, iAId) as TypeWrapper
      tB = tB || getters.getType({ tId: tBId }, iBId) as TypeWrapper
      tBId = tBId || tB.id
      const propNames: string[] = []
      Object.entries(tA.definition).forEach(([, prop]) => {
        if (prop.refTargetTypeId === tBId) {
          propNames.push(prop.name)
        }
      })
      return propNames
    },
    getIsTypeNameUnique: (state) => (name: string) => {
      return !Object.entries(state.project.types).some(([, tw]) => tw.name === name)
    },
    recentChanges: (state) => {
      return state.project.recentChanges
    },
    lastRevertedTransactions: (state) => {
      return state.ui.lastRevertedTransactions
    }
  },
  mutations: {
    OPEN_TRANSACTION(state, actionType: ActionType) {
      if (state.currentTransaction) return
      const id = utils.getUniqueId()
      state.currentTransaction = {
        id,
        actionType,
        changes: []
      }
    },
    CLOSE_TRANSACTION(state) {
      if (!state.currentTransaction) return
      state.project.recentChanges.push({
        ...state.currentTransaction
      })
      console.log('recent changes: ', state.project.recentChanges)
      state.currentTransaction = null
    },
    CREATE_TYPE(state, p: { tId: string }) { // OK
      const { tId } = p

      const uniqueName = utils.getUniqueTypeName(state)

      state.project.types[tId] = {
        name: uniqueName,
        id: tId,
        definition: utils.getNewTypeData()
      }
      state.project.instances[tId] = {}
    },
    RENAME_TYPE(state, p: { tId: string, newName: string }) { // OK
      const { tId, newName } = p

      const type = state.project.types[tId]
      type.name = newName
    },
    REMOVE_TYPE(state, p: { tId: string }) { // OK
      const { tId } = p

      delete state.project.types[tId]
      // At this point all instance are removed
      delete state.project.instances[tId]
    },
    CREATE_PROP(state, p: { tId: string, prop: PropDefinition }) { // OK
      const { tId, prop } = p

      // Prop is added to all existing instances in separate step
      state.project.types[tId].definition[prop.name] = prop
    },
    REMOVE_PROP(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p

      // At this point prop is already removed from all instances
      delete state.project.types[tId].definition[pN]
    },
    RENAME_PROP(state, p: { tId: string, pN: string, newName: string }) { // OK
      const { tId, pN, newName } = p

      state.project.types[tId].definition[pN].name = newName
      state.project.types[tId].definition[newName] = state.project.types[tId].definition[pN]
      delete state.project.types[tId].definition[pN]
    },
    CHANGE_PROP_VALUE_TYPE(state, p: { tId: string, pN: string, newType: ValueType }) { // OK
      const { tId, pN, newType } = p
      console.log('mutating type to: ', newType)

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

      // At this point arity is already changed in all instances
      state.project.types[tId].definition[pN].isArray = isArray
    },
    CHANGE_PROP_REF_TARGET_TYPE(state, p: { tId: string, pN: string, newTargetId: string }) { // OK
      const { tId, pN, newTargetId } = p

      // At this point all instances refs business is resolved
      state.project.types[tId].definition[pN].refTargetTypeId = newTargetId
    },
    CHANGE_PROP_VALUE(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p

      // At this point all instances refs business is resolved
      state.project.instances[tId][iId][pN] = value
    },
    ADD_PROP_VALUE(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p

      // At this point all instances refs business is resolved
      state.project.instances[tId][iId][pN].pushUnique(value[0])
    },
    REMOVE_PROP_VALUE(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
      console.log('mutating prop value and removing: ', value[0])

      // At this point all instances refs business is resolved
      state.project.instances[tId][iId][pN].remove(value[0])
    },
    CREATE_INSTANCE(state, p: { tId: string, iId: string, tN: string, }) { // Ok
      const { tId, iId, tN } = p

      state.project.instances[tId][iId] = utils.getNewInstanceData(state, tN, iId)
    },
    REMOVE_INSTANCE(state, p: { tId: string, iId: string }) { // OK
      const { tId, iId } = p

      delete state.project.instances[tId][iId]
    },
    REMOVE_INSTANCE_PROP(state, p: { tId: string, iId: string, pN: string }) { // OK
      const { tId, iId, pN } = p

      delete state.project.instances[tId][iId][pN]
    },
    RENAME_INSTANCE_PROP(state, p: { tId: string, iId: string, pN: string, newName: string }) { // OK
      const { tId, iId, pN, newName } = p

      state.project.instances[tId][iId][newName] = state.project.instances[tId][iId][pN]
      delete state.project.instances[tId][iId][pN]
    },
    CHANGE_PROP_ORDER(state, p: { tId: string, pN: string, order: number }) { // OK
      const { tId, pN, order } = p

      state.project.types[tId].definition[pN].order = order
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
      this.dispatch('createNewTile', { boardId: 'types', type: 'type', id: tId })
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
      this.dispatch('deleteTile', { boardId: 'types', tileId: tId })
    },
    renameType(state, p: { tId: string, newName: string }) { // OK
      const { tId, newName } = p

      mutate('RENAME_TYPE', { newName }, 'TypeWrapper', tId)
    },
    createProp(state, p: { tId: string }) { // OK
      const { tId } = p
      const uniquePropName = utils.getUniquePropName(state.state, tId)
      const propsCount = state.getters.getPropsCount({ tId })
      const prop = utils.getPropDef('int32', uniquePropName, propsCount)
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
      console.log('renaming prop')

      Object.entries(state.state.project.instances[tId]).forEach(([iId]) => {
        this.dispatch('renameInstanceProp', { tId, iId, pN, newName })
      })

      mutate('RENAME_PROP', { newName }, 'PropDefinition', tId, '', pN)
    },
    changePropType(state, p: { tId: string, pN: string, newType: ValueType }) { // OK
      const { tId, pN, newType } = p
      const isRef = state.getters.isPropARef(tId, pN)
      console.log('changing prop type')

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
      Object.entries(state.state.project.instances[tId]).forEach(([iId, instance]) => {
        const valuesToRemove = [...instance[pN].splice(1)] // all but first (change in place)
        if (isRef) {
          // And in case of ref we will do special stuff ofc.
          valuesToRemove.forEach((v) => this.dispatch('removePropRefValue', { tId, iId, pN, value: [v] }))
        } else {
          valuesToRemove.forEach((v) => this.dispatch('removePropValue', { tId, iId, pN, value: [v] }))
        }
      })

      mutate('CHANGE_PROP_ARITY', { isArray: false }, 'PropDefinition', tId, '', pN)
    },
    changePropTargetType(state, p: { tId: string, pN: string, newTargetId: string }) { // OK
      const { tId, pN, newTargetId } = p

      // Removing values from all instances with this prop.
      // Meta is also cleaned-up.
      Object.entries(state.state.project.instances[tId]).forEach(([iId, instance]) => {
        [...instance[pN]].forEach((v) => {
          this.dispatch('removePropRefValue', { tId, iId, pN, value: [v] })
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

      this.dispatch('removePropValue', { ...p, value: [currentValues[0]] })
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
      console.log('removing prop value: ', value)

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
    // Meta fileds have always order -2
    // Id has always order -1
    // The rest is >=0
    movePropUp(state, p: { tId: string, pN: string }) {
      const { tId, pN } = p
      const type: TypeWrapper = state.getters.getType({ tId })
      const propsInOrder = utils.oToA(type.definition).filter((pDef) => {
        return !(pDef.name.startsWith('meta') || pDef.name === 'id')
      }).sort((pDefA, pDefB) => pDefA.order - pDefB.order)

      const propToMoveUp = propsInOrder.filter((pDef) => pDef.name === pN)[0]
      if (propToMoveUp.name === propsInOrder[0].name) return

      const propToMoveDown = propsInOrder.filter((pDef, i, ar) => ar[i + 1] && ar[i + 1].name === pN)[0]

      // With each reorder order value is brought down in case
      // it was inflated due to props removal (removal is not adjusting order).
      const upperOrder = propToMoveDown.order
      const lowerOrder = upperOrder + 1

      mutate('CHANGE_PROP_ORDER', { order: upperOrder }, 'PropDefinition', tId, '', pN)
      mutate('CHANGE_PROP_ORDER', { order: lowerOrder }, 'PropDefinition', tId, '', propToMoveDown.name)
    },
    movePropDown(state, p: { tId: string, pN: string }) {
      const { tId, pN } = p
      const type: TypeWrapper = state.getters.getType({ tId })
      const propsInOrder = utils.oToA(type.definition).filter((pDef) => {
        return !(pDef.name.startsWith('meta') || pDef.name === 'id')
      }).sort((pDefA, pDefB) => pDefA.order - pDefB.order)

      const propToMoveDown = propsInOrder.filter((pDef) => pDef.name === pN)[0]
      if (propToMoveDown.name === propsInOrder.last().name) return

      const propToMoveUp = propsInOrder.filter((pDef, i, ar) => ar[i - 1] && ar[i - 1].name === pN)[0]

      // With each reorder order value is brought down in case
      // it was inflated due to props removal (removal is not adjusting order).
      const upperOrder = propToMoveDown.order
      const lowerOrder = upperOrder + 1

      mutate('CHANGE_PROP_ORDER', { order: lowerOrder }, 'PropDefinition', tId, '', pN)
      mutate('CHANGE_PROP_ORDER', { order: upperOrder }, 'PropDefinition', tId, '', propToMoveUp.name)
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
    removePropRefValue(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
      console.log('removing prop ref value')

      mutate('REMOVE_PROP_VALUE', { value }, 'PropValues', tId, iId, pN)

      const iA = state.getters.getInstance({ typeId: tId })
      const iB = state.getters.getInstance(value)

      this.dispatch('updateMetaOfRefsFromInstAToInstB', { iA, iB })
    },

    removeAllRefsFromInstAtoInstB(state, p: { aIId: string, bIId: string }) { // OK
      const { aIId, bIId } = p
      const tId = state.getters.getType({ iId: aIId })

      const props = state.getters.getPropsOfTypeAWithRefToTypeB({ iAId: aIId, iBId: bIId })

      props.forEach((pN: string) => {
        this.dispatch('removePropRefValue', { tId, iId: aIId, pN, value: [bIId] })
      })
    },
    removeAllRefsFromInstA(state, p: { iId: string }) { // OK
      const { iId } = p
      const type: TypeWrapper = state.getters.getType({ iId })

      const referencedInstances = state.state.project.instances[type.id][iId].meta_isReferencing

      referencedInstances.forEach((bIId) => {
        this.dispatch('removeAllRefsFromInstAtoInstB', { aIId: iId, bIId })
      })
    },
    removeAllRefsToInstA(state, p: { iId: string }) { // OK
      const { iId } = p
      const type: TypeWrapper = state.getters.getType({ iId })

      const referencingInstances = state.state.project.instances[type.id][iId].meta_isReferencedBy

      referencingInstances.forEach((bId) => {
        this.dispatch('removeAllRefsFromInstAtoInstB', { aIId: bId, bIId: iId })
      })
    },

    removeAllRefsFromEveryPropA(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p

      Object.entries(state.state.project.instances[tId]).forEach(([iId, instance]) => {
        instance[pN].forEach((v) => {
          this.dispatch('removePropRefValue', { tId, iId, pN, value: [v] })
        })
      })
    },

    updateMetaOfRefsFromInstAToInstB(state, p: { iA: Instance, iB: Instance }) { // OK
      const { iA, iB } = p
      const propsToCheck = state.getters.getPropsOfTypeAWithRefToTypeB({ iAId: iA.id[0], iBId: iB.id[0] })
      const tId = state.getters.getType({ iId: iA.id[0] })
      // This is so far an exception - a mutation that makes changes to more than one (here exactly two)
      // entities.
      // For now I'll handle it in a dirty way.
      // If multiple entities mutation case will be more prevalent I can change 'mutate'.
      // mutate(null, {}, 'Instance', tId, iA.id[0]) // Snapshot of changes to one instance (and no mutation)
      // mutate(null, {}, 'Instance', tId, iB.id[0]) // Snapshot of changes to second instance (and no mutation)
      this.commit('UPDATE_REF_META_FROM_A_TO_B', { iA, iB, propsToCheck }) // manually fired mutation
      mutate(null, {}, 'Instance', tId, iA.id[0]) // Snapshot of changes to one instance (and no mutation)
      mutate(null, {}, 'Instance', tId, iB.id[0]) // Snapshot of changes to second instance (and no mutation)
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
      console.log('renaming instance prop')
      mutate('RENAME_INSTANCE_PROP', { newName }, 'PropValues', tId, iId, pN)
    },

    changePropTypeToRef(state, p: { tId: string, pN: string }) { // OK
      const { tId } = p
      let { pN } = p
      console.log('changing prop type to ref')

      // In c++ we rely on convention that all referencing props start with ref_
      if (pN.startsWith('ref_')) {
        this.dispatch('renameProp', { tId, pN, newName: ('ref_' + pN) })
        pN = 'ref_' + pN
      }

      // For this prop in all instance
      Object.entries(state.state.project.instances[tId]).forEach(([iId, instance]) => {
        // Remove all values
        const valuesToRemove = [...instance[pN]]
        console.log('values to remove: ', valuesToRemove)
        valuesToRemove.forEach((v) => this.dispatch('removePropValue', { tId, iId, pN, value: [v] }))
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
      Object.entries(state.state.project.instances[tId]).forEach(([iId, instance]) => {
        // Remove all values
        const valuesToRemove = [...instance[pN]]
        valuesToRemove.forEach((v) => this.dispatch('removePropRefValue', { tId, iId, pN, value: [v] }))
      })

      mutate('CHANGE_PROP_VALUE_TYPE', { newType }, 'PropDefinition', tId, '', pN)
    },
  },
});
