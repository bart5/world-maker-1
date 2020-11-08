import { ActionContext, createStore } from 'vuex';
import * as utils from './utils';
import { registerChange } from './utils'
import { revertChange } from './utils'
import initialState from './state';
import { mutate } from './transactions';

const registerInstancesMutation = (state: ApplicationState) => {
  state.projectInstancesMutated = true
}

const identity = <T>(payload: T) => payload
const typesAndInstances = identity as unknown as typeof createStore

export default typesAndInstances({
  state: initialState,
  getters: {
    projectTypes(state) {
      return state.project.types
    },
    getTypeById: (state) => (typeId: string) => {
      return (Object.entries(state.project.types).find(([id]) => id === typeId) || [null])[0]
    },
    getTypeByName: (state) => (typeName: string) => {
      return (Object.entries(state.project.types).find(([, wrapper]) => wrapper.name === typeName) || [null])[0]
    },
    getType: (state, getters) => (type: { typeId: string, typeName: string }, instanceId?: string) => {
      if (type.typeId) {
        return getters.getTypeById(type.typeId)
      } else if (type.typeName) {
        return getters.getTypeByName(type.typeName)
      }
      return getters.getInstanceType(instanceId)
    },
    getTypeDefinition: (state, getters) => (type: { typeId: string, typeName: string }) => {
      return getters.getType(type)?.definition
    },
    getPropDefinition: (state, getters) => (type: { typeId: string, typeName: string }, propName: string) => {
      return getters.getType(type)?.definition[propName]
    },
    getInstanceByTypeId: (state) => (typeId: string, instanceId: string) => {
      return state.project.instances[typeId][instanceId]
    },
    getInstanceByTypeName: (state, getters) => (typeName: string, instanceId: string) => {
      return getters.getInstanceByTypeId(getters.getType({ typeName }).id, instanceId)
    },
    getInstance: (state, getters) => (instanceId: string, type?: { typeId: string, typeName: string }) => {
      if (type && type.typeId) {
        return getters.getInstanceByTypeId(type.typeId, instanceId)
      } else if (type && type.typeName) {
        return getters.getInstanceByTypeName(type.typeName, instanceId)
      }
      const instance: Instance[] = []
      utils.oToA(state.project.instances).some((instanceList) => {
        return instanceId in instanceList && instance.push(instanceList[instanceId])
      })
      return instance[0]
    },
    getInstanceType: (state, getters) => (instanceId: string) => {
      const type: TypeWrapper[] = []
      Object.entries(state.project.instances).some(([typeId, instanceList]) => {
        return instanceId in instanceList && type.push(getters.getType({ typeId }))
      })
      return type[0]
    },
    getPropRefTarget: () => (
      p: { propName: string, typeId: string, instanceId: string },
      st: ActionContext<ApplicationState, ApplicationState>
    ) => {
      const { propName, typeId, instanceId } = p
      let type: TypeWrapper
      if (typeId) {
        type = st.getters.getTypeById(typeId)
      } else {
        type = st.getters.getInstanceType(instanceId)
      }
      return type.definition[propName].refTargetTypeId
    },
    getAllInstancesByTypeId: (state) => (typeId: string) => {
      return utils.oToA<Instance>(state.project.instances[typeId])
    },
    getAllInstancesByTypeName: (state, getters) => (typeName: string) => {
      return utils.oToA<Instance>(state.project.instances[getters.getTypeByName(typeName).id])
    },
    getAllInstancesOfType: (state, getters) => (type: { typeId: string, typeName: string }) => {
      if (type.typeId) {
        return getters.getAllInstancesByTypeId(type.typeId)
      }
      return getters.getAllInstancesByTypeName(type.typeName)
    },
    getInstancesWithEmptyValues: (state) => {
      const instances: { instanceId: string, typeId: string }[] = []

      Object.entries(state.project.instances).forEach(([typeId, instanceList]) => { // for each type instance
        Object.entries(instanceList).forEach(([instanceId, instance]) => {
          Object.entries(instance).forEach(([propName, prop]) => {
            if (!propName.includes('meta') || propName !== 'id') {
              if (!prop.values.length) {
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
    getAllTypeIdsReferencingType: (state) => (typeId: string) => {
      const types = state.project.types
      return Object.entries(types).reduce((acc, [tId]) => {
        return Object.entries(types[tId].definition).some(([, prop]) => {
          return prop.refTargetTypeId === typeId
        }) ? [...acc, tId] : acc
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
    getFilteredInstances: (state, getters) => (
      payload: {
        instanceId: string,
        typeName: string,
        prop: { name: string, value: string | number | boolean },
        isReferencedById: string,
        isReferencingId: string,
        instances: Instance[]
      }
    ) => {
      const { instanceId, typeName, prop, isReferencedById, isReferencingId } = payload
      let { instances } = payload
      if (!instances) {
        instances = []
        Object.entries(state.project.instances).forEach(([, instanceList]) => {
          instances.push(
            ...Object.entries(instanceList).map(([, instance]) => instance)
          )
        })
      }
      if (instanceId) {
        let match: any = null
        instances.some((i) => {
          if (i.id.values[0] === instanceId) {
            match = i
            return true
          }
          return false
        })
        instances = match ? [match] : []
        return getters.getters.getFilteredInstances({ typeName, prop, isReferencedById, isReferencingId, instances })
      }
      if (typeName) {
        instances.filter((i) => i.meta_typeName.values[0] === typeName)
        return getters.getters.getFilteredInstances({ prop, isReferencedById, isReferencingId, instances })
      }
      if (prop) {
        const matchByPropValue = (i: Instance) => {
          return Object.entries(i).some((p) => p[0] === prop.name && p[1].values.some((v) => v === prop.value))
        }
        instances.filter(matchByPropValue)
        return getters.getters.getFilteredInstances({ isReferencedById, isReferencingId, instances })
      }
      if (isReferencedById) {
        instances.filter((i) => i.meta_isReferencedBy.values.some((v) => v === isReferencedById))
        return getters.getters.getFilteredInstances({ isReferencingId, instances })
      }
      if (isReferencingId) {
        instances.filter((i) => i.meta_isReferencing.values.some((v) => v === isReferencingId))
        return getters.getters.getFilteredInstances({ instances })
      }
      return instances
    }
  },
  mutations: {
    OPEN_TRANSACTION(state, changeType: ChangeType) {
      if (state.currentTransaction) return
      state.currentTransaction = {
        changeType,
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
    // CREATE_TYPE(state, p: { sbj: TypeWrapper, tId: string, eT: EntityType, iId: string, pN: string }) {
    CREATE_TYPE(state, p: MutCtx) {
      registerInstancesMutation(state)
      const { tId } = p

      const uniqueName = utils.getUniqueTypeName(state)

      state.project.types[tId] = {
        name: uniqueName,
        id: tId,
        definition: utils.getNewTypeData()
      }
      state.project.instances[tId] = {}
    },
    RENAME_TYPE(state, p: MutCtx) {
      registerInstancesMutation(state)
      const { tId, newName } = p

      const type = state.project.types[tId]
      type.name = newName

      Object.entries(state.project.instances[tId]).forEach(([, instance]) => {
        instance.meta_typeName.values = [newName]
      })
    },
    REMOVE_TYPE(state, p: MutCtx) {
      const { tId } = p
      registerInstancesMutation(state)

      delete state.project.types[tId]
      delete state.project.instances[tId]
    },
    CREATE_TYPE_PROPERTY(state, typeName: string) {
      registerInstancesMutation(state)
      const uniquePropName = utils.getUniquePropName(state, typeName)

      // Adding prop to type definition
      state.project.types[typeName] = {
        ...state.project.types[typeName],
        [uniquePropName]: utils.getTypeDefProp('int32', uniquePropName)
      }

      // Adding prop to all instances
      Object.entries(state.project.instances[typeName]).forEach((tuple) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let instance = tuple[1]
        instance = {
          ...instance,
          uniquePropName: utils.getInstanceProp('int32', uniquePropName, [0])
        }
      })
    },
    CREATE_TYPE_INSTANCE(state, typeName: string) {
      registerInstancesMutation(state)
      const uniqueInstanceId = utils.getUniqueInstanceId(state)

      state.project.instances[typeId].definition[uniqueInstanceId] = utils.getNewInstanceData(state, typeName, uniqueInstanceId)
    },
    REMOVE_TYPE_INSTANCE(state, payload: { typeName: string, instanceId: string }) {
      registerInstancesMutation(state)

      delete state.project.instances[payload.typeName][payload.instanceId]
    },
    UPDATE_REF_META_FROM_A_TO_B(state, p: { iA: Instance, iB: Instance, propsToCheck: string[] }) {
      const { iA, iB, propsToCheck } = p
      const iAId = iA.id.values[0]
      const iBId = iB.id.values[0]

      const aReferencesB = propsToCheck.some((propName) => {
        return iA[propName].values.includes(iBId)
      })

      if (aReferencesB) {
        iA.meta_isReferencing.values.pushUnique(iBId)
        iB.meta_isReferencedBy.values.pushUnique(iAId)
      } else {
        iA.meta_isReferencing.values.remove(iBId)
        iB.meta_isReferencedBy.values.remove(iAId)
      }
    },
    REMOVE_PROP_VALUE(state) {
      /*  */
    }
  },
  actions: {
    change(state, p: { changeType: ChangeType, context: any }) {
      const { changeType, context } = p
      this.dispatch('openTransaction', changeType)
      this.dispatch(changeType, context)
      this.dispatch('closeTransaction', changeType)
    },
    openTransaction(state, changeType: ChangeType) {
      state.commit('OPEN_TRANSACTION', changeType)
    },
    closeTransaction(state) {
      state.commit('CLOSE_TRANSACTION')
    },
    /* =====================================================================
     *
     *                    PUBLIC CHANGES API START
     *
     *====================================================================== */
    createType(state) { // OK
      const tId = utils.getUniqueId(state.state)
      mutate('CREATE_TYPE', {}, 'TypeWrapper', tId)
    },
    removeType(state, p: { tId: string }) {
      const { tId } = p
      Object.entries(state.state.project.instances[tId]).forEach(([iId]) => {
        this.dispatch('removeInstance', { tId, iId })
      })

      // Tell propDefs in other types that this type is no longer available
      Object.entries(state.state.project.types).forEach(([typeId, wrapper]) => {
        if (typeId === tId) return

        utils.getPropsOfTypeAWithRefToTypeB(state, { typeAId: wrapper.id, typeBId: tId })
          .forEach((pN) => {
            //  This is slightly inefficient since it will also update metadata
            // about references for the type we are about to remove.
            //  I assume that empty string will make sense - if handled properly it will yield
            // no instances available to ref
            this.dispatch('changePropRefTargetType', { tId, pN, newTargetId: '' })
          })
      })

      mutate('REMOVE_TYPE', {}, 'TypeWrapper', tId)
    },
    renameType(state, p: { tId: string, newName: string }) {
      const { tId, newName } = p

      utils.oToA(state.state.project.instances[typeId]).forEach((instance) => {
        this.dispatch('changePropValues') // IMPLEMENT
      })

      mutate('RENAME_TYPE', { newName }, 'TypeWrapper', tId)
    },
    createProp(state, p: { tId: string }) {
      const { tId } = p
      mutate('CREATE_TYPE_PROPERTY', {}, 'PropDefinition', tId)

      utils.oToA(state.state.project.instances[tId]).forEach((instance) => {
        this.dispatch('addPropToInstance') // IMPLEMENT
      })
    },
    removeProp(state, p: { tId: string, pN: string }) {
      const { tId, pN } = p

      this.dispatch('removeAllRefsFromEveryPropA', p)

      mutate('REMOVE_PROP', {}, 'PropDefinition', tId, '', pN)
    },
    renameProp(state, p: { tId: string, pN: string, newName: string }) {
      const { tId, pN, newName } = p
      mutate('RENAME_PROP', { newName }, 'PropDefinition', tId, '', pN)
    },
    changePropValueType(state, p: { tId: string, pN: string, newType: ValueType }) {
      const { tId, pN, newType } = p
      mutate('CHANGE_PROP_VALUE_TYPE', { newType }, 'PropDefinition', tId, '', pN)
    },
    changePropToArray(state, p: { tId: string, pN: string }) {
      const { tId, pN } = p
      mutate('CHANGE_PROP_TO_ARRAY', {}, 'PropDefinition', tId, '', pN)
      this.commit('CHANGE_PROP_TO_ARRAY')
    },
    changePropToSingle(state, p: { tId: string, pN: string }) {
      const { tId, pN } = p

      // IMPLEMENT
      const values: string[]
      const toRemove = values.splice(1)
      if (isRef) {
        toRemove.forEach((v) => {
          this.dispatch('removePropRefValue')
        })
      } else {
        toRemove.forEach((v) => {
          this.dispatch('removePropValue')
        })
      }

      mutate('CHANGE_PROP_TO_SINGLE', {}, 'PropDefinition', tId, '', pN)
    },
    changePropValueTypeToRef(state, p: { tId: string, pN: string }) {
      const { tId, pN } = p

      // IMPLEMENT
      const values: string[]
      values.forEach((v) => {
        this.dispatch('removePropRefValue')
      })

      // REMEMBER TO ADD refTargetTypeId
      mutate('CHANGE_PROP_VALUE_TYPE_TO_REF', {}, 'PropDefinition', tId, '', pN)
    },
    changePropValueTypeFromRef(state, p: { tId: string, pN: string, newType: ValueType }) {
      const { tId, pN, newType } = p

      // IMPLEMENT
      const values: string[]
      values.forEach((v) => {
        this.dispatch('removePropValue')
      })

      // REMEMBER TO REMOVE refTargetTypeId
      mutate('CHANGE_PROP_VALUE_TYPE', { newType }, 'PropDefinition', tId, '', pN)
    },
    changePropRefTargetType(state, p: { tId: string, pN: string, newTargetId: string }) {
      const { tId, pN, newTargetId } = p
      // Removing values from all instances with this prop.

      // Meta is also cleaned-up.
      utils.oToA(state.state.project.instances[tId]).forEach((instance) => {
        instance[pN].values.forEach((v) => {
          this.dispatch('removePropRefValue', { tId, pN, value: v })
        })
      })

      mutate('CHANGE_PROP_REF_TARGET_TYPE', { newTargetId }, 'PropDefinition', tId, '', pN)
    },
    changePropValue(state, p: { tId: string, pN: string, value: Values }) {
      const { tId, pN, value } = p

      mutate('CHANGE_PROP_VALUE', { value }, 'InstanceProp', tId, '', pN)
    },
    addPropValue(state, p: { tId: string, pN: string, value: Values }) {
      const { tId, pN, value } = p
      const isRef = state.getters.isPropARef(tId, pN)

      if (isRef) {
        this.dispatch('addPropRefValue', p)
      } else {
        mutate('ADD_PROP_VALUE', { value }, 'InstanceProp', tId, '', pN)
      }
    },
    removePropValue(state, p: { tId: string, pN: string, value: Values }) {
      const { tId, pN, value } = p
      const isRef = state.getters.isPropARef(tId, pN)

      if (isRef) {
        this.dispatch('removePropRefValue', p)
      } else {
        mutate('REMOVE_PROP_VALUE', { value }, 'InstanceProp', tId, '', pN)
      }
    },
    createInstance(state, p: { tId: string }) {
      const { tId } = p
      this.commit('CREATE_TYPE_INSTANCE', p)
      mutate('REMOVE_PROP_VALUE', {}, 'InstanceProp', tId)
    },
    removeInstance(state, p: { tId: string, iId: string }) {
      const { tId, iId } = p

      this.dispatch('removeAllRefsFromInstA', { iId })
      this.dispatch('removeAllRefsToInstA', { iId })

      mutate('REMOVE_TYPE_INSTANCE', {}, 'InstanceProp', tId, iId)
    },
    /* =====================================================================
     *
     *                    PUBLIC CHANGES API END
     *
     *====================================================================== */

    addPropRefValue(state, p: { tId: string, pN: string, value: Values }) {
      const { tId, pN, value } = p

      mutate('ADD_PROP_VALUE', { value }, 'InstanceProp', tId, '', pN)

      const instA = state.getters.getInstance(p.aId)
      const instB = state.getters.getInstance(p.bId)

      this.dispatch('updateMetaOfRefsFromInstAToInstB', { iA: instA, iB: instB })
    },
    removePropRefValue(state, p: { tId: string, pN: string, value: Values }) {
      const { tId, pN, value } = p

      mutate('REMOVE_PROP_VALUE', { value }, 'InstanceProp', tId, '', pN)

      const instA = state.getters.getInstance(p.aId)
      const instB = state.getters.getInstance(p.bId)

      this.dispatch('updateMetaOfRefsFromInstAToInstB', { iA: instA, iB: instB })
    },

    removeAllRefsFromInstAtoInstB(state, p: { aId: string, bId: string }) {
      const { aId, bId } = p

      const props = utils.getPropsOfTypeAWithRefToTypeB(state, { instAId: aId, instBId: bId })

      props.forEach((propName) => {
        this.dispatch('removePropRefValue', { aId, aPropName: propName, bId })
      })
    },
    removeAllRefsFromInstA(state, p: { iId: string }) {
      const { iId } = p
      const type: TypeWrapper = state.getters.getType({ instanceId: iId })

      const referencedInstances = state.state.project.instances[type.id][iId].meta_isReferencing.values

      referencedInstances.forEach((bId) => {
        this.dispatch('removeAllRefsFromInstAtoInstB', { aId: iId, bId })
      })
    },
    removeAllRefsToInstA(state, p: { iId: string }) {
      const { iId } = p
      const type: TypeWrapper = state.getters.getType({ instanceId: iId })

      const referencingInstances = state.state.project.instances[type.id][iId].meta_isReferencedBy.values

      referencingInstances.forEach((bId) => {
        this.dispatch('removeAllRefsFromInstAtoInstB', { aId: bId, bId: iId })
      })
    },

    removeAllRefsFromEveryPropA(state, p: { tId: string, pN: string }) { // ALL ARGS
      const { tId, pN } = p

      utils.oToA(state.state.project.instances[tId]).forEach((instance) => {

        instance[pN].values.forEach((v) => {
          this.dispatch('removePropRefValue', { tId, pN, value: v })
        })
      })
    },

    updateMetaOfRefsFromInstAToInstB(state, p: { iA: Instance, iB: Instance }) {
      const { iA, iB } = p
      const propsToCheck = utils.getPropsOfTypeAWithRefToTypeB(state, { instAId: iA.id.values[0], instBId: iB.id.values[0] })
      this.commit('UPDATE_REF_META_FROM_A_TO_B', { iA, iB, propsToCheck })
    },

    addPropToInstance(state, payload) {
      this.commit('ADD_PROP_TO_INSTANCE', payload)
    },

    moveTypePropUp(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('MOVE_TYPE_PROP_UP', payload)
    },
    moveTypePropDown(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('MOVE_TYPE_PROP_DOWN', payload)
    },
  },
});
