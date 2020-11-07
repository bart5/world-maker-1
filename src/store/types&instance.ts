import { ActionContext, createStore } from 'vuex';
import * as utils from './utils';
import { registerChange } from './utils'
import { revertChange } from './utils'
import initialState from './state';

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
    CREATE_TYPE(state) {
      registerInstancesMutation(state)
      const uniqueName = utils.getUniqueTypeName(state)
      const uniqueId = utils.getUniqueId(state)

      registerChange(state, null, 'TypeWrapper', uniqueId, '')

      state.project.types[uniqueId] = {
        name: uniqueName,
        id: uniqueId,
        definition: utils.getNewTypeData()
      }
      state.project.instances[uniqueId] = {}
    },
    RENAME_TYPE(state, payload: { typeId: string, newName: string }) {
      registerInstancesMutation(state)
      const { typeId, newName } = payload

      registerChange(state, state.project.types[typeId], 'TypeWrapper', '', '')

      const type = state.project.types[typeId]
      type.name = newName

      Object.entries(state.project.instances[typeId]).forEach(([, instance]) => {
        instance.meta_typeName.values = [newName]
      })
    },
    REMOVE_TYPE(state, typeId: string) {
      registerInstancesMutation(state)

      // Also reset values for all props that were references to the removed type

      // This should be initiated in action
      // Object.entries(state.project.types).forEach(([typeId, wrapper]) => { // each type
      //   const tName = tuple1[0]
      //   const typeDefinition = wrapper.definition

      //   Object.entries(typeDefinition).forEach((tuple2) => { // each prop definition
      //     const propName = tuple2[0]
      //     const targetTypeName = tuple2[1].refTargetTypeId
      //     if (targetTypeName && targetTypeName === typeName) {
      //       Object.entries(state.project.instances[tName]).forEach((tuple3) => { // each prop instance
      //         tuple3[1][propName].values = []
      //       })
      //     }
      //   })
      // })

      registerChange(state, state.project.types[typeId], 'TypeWrapper', '', '')

      delete state.project.types[typeId]
      delete state.project.instances[typeId]
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
    ADD_REF_FROM_A_TO_B(state, p: { instA: Instance, aPropName: string, instBId: string }) {
      const { instA, aPropName, instBId } = p
      instA[aPropName].values.pushUnique(instBId)
    },
    ADD_REF_META_FROM_A_TO_B(state, p: { instA: Instance, instB: Instance }) {
      const { instA, instB } = p
      instA.meta_isReferencing.values.pushUnique(instB.id.values[0])
      instB.meta_isReferencedBy.values.pushUnique(instA.id.values[0])
    },
    REMOVE_REF_FROM_A_TO_B(state, p: { instA: Instance, aPropName: string, instBId: string }) {
      const { instA, aPropName, instBId } = p
      instA[aPropName].values.remove(instBId)
    },
    REMOVE_REF_META_FROM_A_TO_B(state, p: { instA: Instance, instB: Instance }) {
      const { instA, instB } = p
      instA.meta_isReferencing.values.remove(instB.id.values[0])
      instB.meta_isReferencedBy.values.remove(instA.id.values[0])
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
    /* === CHANGES START HERE === */
    createType(state) {
      this.commit('CREATE_TYPE')
    },
    removeType(state, typeId: string) {
      utils.oToA(state.state.project.instances[typeid]).forEach((instance) => {
        this.dispatch('removeInstance') // ARGS
      })

      // tell propDefs of other types that this type is no longer available
      utils.oToA(state.state.project.types).forEach((typeWrapper) => {
        if (typeWrapper.id === typeId) return

        utils.getPropsOfAWithRefToB(state, { typeAId: typeWrapper.id, typeBId: typeId })
          .forEach((propName) => {
            this.dispatch('changePropRefTargetType') // ARGS
          })
      })

      this.commit('REMOVE_TYPE', typeName)
    },
    renameType(state, payload: { typeId: string, newName: string, changeId: string }) {
      utils.oToA(state.state.project.instances[typeId]).forEach((instance) => {
        this.dispatch('changePropValues') // ARGS
      })

      this.commit('RENAME_TYPE', payload)
    },
    createProp(state, typeName: string) {
      this.commit('CREATE_TYPE_PROPERTY', typeName)
      utils.oToA(state.state.project.instances[typeId]).forEach((instance) => {
        this.dispatch('addPropToInstance') // ARGS
      })
    },
    removeProp(state, payload: { propName: string, instanceId: string, revert: boolean }) {
      const { propName, instanceId, revert } = payload

      this.dispatch('removeAllRefsFromPropA') // ARGS

      const instance = state.getters.getInstance(instanceId)
      this.commit('REMOVE_PROP', { propName, instance })
    },
    renameProp(state, payload: { propName: string, instanceId: string, revert: boolean }) {
      // rename prop in type and instances
      this.commit('RENAME_PROP') // ARGS
    },
    changePropValueType(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      this.commit('CHANGE_PROP_VALUE_TYPE')
    },
    changePropToArray(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      this.commit('CHANGE_PROP_TO_ARRAY')
    },
    changePropToSingle(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
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
      this.commit('CHANGE_PROP_TO_SINGLE')
    },
    changePropValueTypeToRef(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      const values: string[]
      values.forEach((v) => {
        this.dispatch('removePropRefValue')
      })
      this.commit('CHANGE_PROP_VALUE_TYPE_TO_REF') // REMEMBER TO ADD refTargetTypeId
    },
    changePropValueTypeFromRef(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      const values: string[]
      values.forEach((v) => {
        this.dispatch('removePropValue')
      })
      this.commit('CHANGE_PROP_VALUE_TYPE') // REMEMBER TO REMOVE refTargetTypeId
    },
    changePropRefTargetType(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      const values: string[]
      values.forEach((v) => {
        this.dispatch('removePropRefValue')
      })
      this.commit('CHANGE_PROP_REF_TARGET_TYPE')
    },
    addPropRefValue(state, p: { aId: string, aPropName: string, bId: string }) {
      const instA = state.getters.getInstance(p.aId)
      const instB = state.getters.getInstance(p.bId)
      // this.commit('ADD_REF_FROM_A_TO_B', { instA, aPropName: p.aPropName, instBId: p.bId })
      this.commit('ADD_PROP_VALUE')
      this.dispatch('addRefMetaFromAtoB', { instA, instB })
    },
    removePropRefValue(state, p: { aId: string, aPropName: string, bId: string }) {
      const instA = state.getters.getInstance(p.aId)
      const instB = state.getters.getInstance(p.bId)
      // this.commit('REMOVE_REF_FROM_A_TO_B', { instA, aPropName: p.aPropName, instBId: p.bId })
      this.commit('REMOVE_PROP_VALUE')
      this.dispatch('removeRefMetaFromAToB', { instA, instB })
    },
    changePropValue(state, typeName: string) {
      this.commit('CHANGE_PROP_VALUE', typeName)
    },
    addPropValue(state, typeName: string) {
      if (isRef) {
        this.dispatch('addPropRefValue')
      } else {
        this.commit('ADD_PROP_VALUE')
      }
      this.commit('CHANGE_PROP_VALUES', typeName)
    },
    removePropValue(state, typeName: string) {
      if (isRef) {
        this.dispatch('removePropRefValue')
      } else {
        this.commit('REMOVE_PROP_VALUE')
      }
    },
    createInstance(state, typeName: string) {
      this.commit('CREATE_TYPE_INSTANCE', typeName)
    },
    removeInstance(state, payload: { typeName: string, instanceId: string }) {
      const { typeName, instanceId } = payload

      this.dispatch('removeAllRefsFromA') // args
      this.dispatch('removeAllRefsToA') // args

      this.commit('REMOVE_TYPE_INSTANCE', payload)
    },
    /* === CHANGES END HERE === */

    addRefMetaFromAToB(state, p: { aId: string, bId: string, instA?: Instance, instB?: Instance }) {
      const instA = p.instA || state.getters.getInstance(p.aId)
      const instB = p.instB || state.getters.getInstance(p.bId)
      this.commit('ADD_REF_META_FROM_A_TO_B', { instA, instB })
    },
    removeRefMetaFromAToB(state, p: { aId: string, bId: string, instA?: Instance, instB?: Instance }) {
      const instA = p.instA || state.getters.getInstance(p.aId)
      const instB = p.instB || state.getters.getInstance(p.bId)
      this.commit('REMOVE_REF_META_FROM_A_TO_B', { instA, instB })
    },
    removeAllRefsFromAtoB(state, p: { aId: string, bId: string }) {
      const { aId, bId } = p
      const refingProps = utils.getPropsOfAWithRefToB(state, { instAId: aId, instBId: bId })
      refingProps.forEach((propName) => {
        this.dispatch('removePropRefValue', { aId, aPropName: propName, bId })
      })
    },
    removeAllRefsFromA(state, p: { aId: string }) {
      const type: TypeWrapper = state.getters.getType({ instanceId: p.aId })
      const references = state.state.project.instances[type.id][p.aId].meta_isReferencing.values
      references.forEach((bId) => {
        this.dispatch('removeAllRefsFromAtoB', { aId: p.aId, bId })
      })
    },
    removeAllRefsToA(state, p: { aId: string }) {
      const type: TypeWrapper = state.getters.getType({ instanceId: p.aId })
      const references = state.state.project.instances[type.id][p.aId].meta_isReferencedBy.values
      references.forEach((bId) => {
        this.dispatch('removeAllRefsFromAtoB', { aId: bId, bId: p.aId })
      })
    },
    removeAllRefsFromPropA(state) { // ALL ARGS
      const propValues: string []
      propValues.forEach((v) => {
        this.dispatch('removePropRefValue', { aId, aPropName: propName, bId: v })
      })
    },

    addPropToInstance(state, payload) {
      this.commit('ADD_PROP_TO_INSTANCE', payload)
    },

    // duplicateType(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
    //   /*  */
    // },
    // duplicateInstance(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
    //   /*  */
    // },

    moveTypePropUp(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('MOVE_TYPE_PROP_UP', payload)
    },
    moveTypePropDown(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('MOVE_TYPE_PROP_DOWN', payload)
    },
  },
});
