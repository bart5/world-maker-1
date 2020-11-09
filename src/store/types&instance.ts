import { ActionContext, createStore } from 'vuex';
import * as utils from './utils';
import initialState from './state';
import { mutate } from './transactions';
import { revertChange } from './transactions';

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
    getTypeName: (state, getters) => (type: { typeId: string, typeName: string }, instanceId?: string) => {
      return (getters.getType(type, instanceId) as TypeWrapper).name
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
          if (i.id[0] === instanceId) {
            match = i
            return true
          }
          return false
        })
        instances = match ? [match] : []
        return getters.getters.getFilteredInstances({ typeName, prop, isReferencedById, isReferencingId, instances })
      }
      if (typeName) {
        instances.filter((i) => getters.getTypeName({ typeId: i.meta_typeId[0] }) === typeName)
        return getters.getters.getFilteredInstances({ prop, isReferencedById, isReferencingId, instances })
      }
      if (prop) {
        const matchByPropValue = (i: Instance) => {
          return Object.entries(i).some(([pId, pValues]) => pId === prop.name && pValues.some((v) => v === prop.value))
        }
        instances.filter(matchByPropValue)
        return getters.getters.getFilteredInstances({ isReferencedById, isReferencingId, instances })
      }
      if (isReferencedById) {
        instances.filter((i) => i.meta_isReferencedBy.some((v) => v === isReferencedById))
        return getters.getters.getFilteredInstances({ isReferencingId, instances })
      }
      if (isReferencingId) {
        instances.filter((i) => i.meta_isReferencing.some((v) => v === isReferencingId))
        return getters.getters.getFilteredInstances({ instances })
      }
      return instances
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
     *                    PUBLIC CHANGES API START
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

      mutate('RENAME_PROP', { newName }, 'PropDefinition', tId, '', pN)
    },
    changePropValueType(state, p: { tId: string, pN: string, newType: ValueType }) { // OK
      const { tId, pN, newType } = p
      const isRef = state.getters.isPropARef(tId, pN)

      if (isRef) {
        this.dispatch('changePropValueTypeFromRef', p)
        return
      } else if (newType === 'ref') {
        this.dispatch('changePropValueTypeToRef', p)
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
    changePropRefTargetType(state, p: { tId: string, pN: string, newTargetId: string }) { // OK
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
      const { tId, iId, pN, value } = p

      mutate('CHANGE_PROP_VALUE', { value }, 'PropValues', tId, iId, pN)
    },
    addPropValue(state, p: { tId: string, iId: string, pN: string, value: Values }) { // OK
      const { tId, iId, pN, value } = p
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
     *                    PUBLIC CHANGES API END
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

      const props = utils.getPropsOfTypeAWithRefToTypeB(state, { instAId: aIId, instBId: bIId })

      props.forEach((pN) => {
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
      const propsToCheck = utils.getPropsOfTypeAWithRefToTypeB(state, { instAId: iA.id[0], instBId: iB.id[0] })
      const tId = state.getters.getType({}, iA.id[0])
      // This is so far an exception - a mutation that makes changes to more than one (here exactly two)
      // entities.
      // For now I'll handle it in a dirty way.
      // If case of multiple entities mutation at once will be more prevalent I can change 'mutate'.
      // mutate('UPDATE_REF_META_FROM_A_TO_B', { iA, iB, propsToCheck }, 'Instance', tId)
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

    changePropValueTypeToRef(state, p: { tId: string, pN: string }) { // OK
      const { tId, pN } = p

      // For this prop in all instance
      Object.entries(state.state.project.instances[tId]).forEach(([, instance]) => {
        // Remove all values
        const valuesToRemove = instance[pN]
        valuesToRemove.forEach((v) => this.dispatch('removePropValue', { tId, pN, value: v }))
      })

      mutate('CHANGE_PROP_VALUE_TYPE', { newType: 'ref' }, 'PropDefinition', tId, '', pN)
    },
    changePropValueTypeFromRef(state, p: { tId: string, pN: string, newType: ValueType }) { // OK
      const { tId, pN, newType } = p

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
