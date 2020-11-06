import { createStore } from 'vuex';
import * as utils from './utils';
import initialState from './state';

const registerInstancesMutation = (state: ApplicationState) => {
  state.projectInstancesMutated = true
}
// const registerUiDataMutation = (state: ApplicationState) => {
//   state.projectUiDataMutated = true
// }
// const resetMutations = (state: ApplicationState) => {
//   state.projectUiDataMutated = false
//   state.projectInstancesMutated = false
//   state.projectEntityBindingsMutated = false
// }

const identity = (payload: any) => payload
const typesAndInstances = identity as unknown as typeof createStore

export default typesAndInstances({
  state: initialState,
  getters: {
    projectTypes: (state) => {
      return state.project.types
    },
    getTypeByName: (state) => (typeName: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return (Object.entries(state.project.types).find(([id, wrapper]) => wrapper.name === typeName) || [null])[0]
    },
    getTypeById: (state) => (typeId: string) => {
      return (Object.entries(state.project.types).find(([id]) => id === typeId) || [null])[0]
    },
    getTypeDefinition: (state, getters) => (typeName: string) => {
      return getters.getTypeByName(typeName)?.definition
    },
    getPropDefinition: (state, getters) => (typeName: string, propName: string) => {
      return getters.getTypeByName(typeName)?.definition[propName]
    },
    getInstanceByTypeId: (state) => (typeId: string, instanceId: string) => {
      return state.project.instances[typeId].definition[instanceId]
    },
    getInstanceByTypeName: (state, getters) => (typeName: string, instanceId: string) => {
      return getters.getInstanceByTypeId(getters.getTypeByName(typeName).id, instanceId)
    },
    getAllInstancesByTypeId: (state) => (typeId: string) => {
      return state.project.instances[typeId]
    },
    getAllInstancesByTypeName: (state, getters) => (typeName: string) => {
      return state.project.instances[getters.getTypeByName(typeName).id]
    },
    // Instances
    getUnfinishedInstances: (state) => {
      const notReadyInstances: { instanceId: string, type: string }[] = []

      Object.entries(state.project.instances).forEach((t) => {
        Object.entries(t[1]).forEach((i) => {
          Object.entries(i[1]).forEach((p) => {
            if (!p[0].includes('meta') || p[0] !== 'id') {
              if (!p[1].values.length) {
                notReadyInstances.push({
                  instanceId: i[0],
                  type: t[0]
                })
              }
            }
          })
        })
      })

      return notReadyInstances
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
        Object.entries(state.project.instances).forEach((tuple) => {
          instances.push(
            ...Object.entries(state.project.instances[tuple[0]]).map((tuple2) => tuple2[1])
          )
        })
      }
      if (instanceId) {
        let match: any = null
        instances.some((i) => {
          if (i.id.values[0] === instanceId) {
            match = i
          }
          return true
        })
        instances = [match] || []
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
    CREATE_TYPE(state) {
      registerInstancesMutation(state)
      const uniqueName = utils.getUniqueTypeName(state)

      state.project.types[uniqueName] = utils.getNewTypeData()
      state.project.instances[uniqueName] = {}
    },
    RENAME_TYPE(state, payload: { oldTypeName: string, newTypeName: string }) {
      registerInstancesMutation(state)

      if (payload.newTypeName in state.project.types) {
        console.error('Tried to rename type with already taken name.')
        return
      }

      state.project.types[payload.newTypeName] = {
        ...state.project.types[payload.oldTypeName]
      }

      Object.entries(state.project.instances[payload.newTypeName]).forEach((tuple) => {
        const instance = tuple[1]
        instance.meta_typeName.values = [payload.newTypeName]
      })

      delete state.project.types[payload.oldTypeName]
    },
    REMOVE_TYPE(state, typeName: string) {
      registerInstancesMutation(state)

      // Also reset values for all props that were references to the removed type
      Object.entries(state.project.types).forEach((tuple1) => { // each type
        const tName = tuple1[0]
        const typeDefinition = tuple1[1]

        Object.entries(typeDefinition).forEach((tuple2) => { // each prop definition
          const propName = tuple2[0]
          const targetTypeName = tuple2[1].refTargetType
          if (targetTypeName && targetTypeName === typeName) {
            Object.entries(state.project.instances[tName]).forEach((tuple3) => { // each prop instance
              tuple3[1][propName].values = []
            })
          }
        })
      })

      delete state.project.types[typeName]
      delete state.project.instances[typeName]
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
    UPDATE_TYPE_PROPERTY(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      registerInstancesMutation(state)
      const oldProp = state.project.types[payload.typeName][payload.oldPropName]
      const isRename = payload.oldPropName !== payload.newProp.name
      const isValueTypeChange = oldProp.valueType !== payload.newProp.valueType
      const isArrayChange = oldProp.isArray !== payload.newProp.isArray
      const isRefChange = oldProp.isRef !== payload.newProp.isRef
      const isRefTargetChange = oldProp.refTargetType !== payload.newProp.refTargetType

      // Updating prop in type definition
      state.project.types[payload.typeName][payload.newProp.name] = {
        ...payload.newProp
      }
      if (isRename) {
        delete state.project.types[payload.typeName][payload.oldPropName]
      }

      // Updating prop in all instances
      const getNewValues = (oldValues: Array<string | number | boolean>) => {
        if (isValueTypeChange || isRefChange || isRefTargetChange) {
          return utils.getInitialPropValues(payload.newProp)
        }
        if (isArrayChange) {
          return [oldValues[0]]
        }
        return oldValues
      }
      Object.entries(state.project.instances[payload.typeName]).forEach((tuple) => {
        const instance = tuple[1]
        const oldPropInst = instance[payload.oldPropName]

        instance[payload.newProp.name] = {
          ...payload.newProp,
          values: getNewValues(oldPropInst.values)
        }

        if (isRename) {
          delete instance[payload.oldPropName]
        }
      })
    },
    REMOVE_TYPE_PROPERTY(state, payload: { propName: string, typeName: string }) {
      registerInstancesMutation(state)

      // Remove prop from type definition
      delete state.project.types[payload.typeName][payload.propName]

      // Remove prop from all instances
      Object.entries(state.project.instances[payload.typeName]).forEach((tuple) => {
        const instance = tuple[1]
        delete instance[payload.propName]
      })
    },
    CREATE_TYPE_INSTANCE(state, typeName: string) {
      registerInstancesMutation(state)
      const uniqueInstanceId = utils.getUniqueInstanceId(state)

      state.project.instances[typeId].definition[uniqueInstanceId] = utils.getNewInstanceData(state, typeName, uniqueInstanceId)
    },
    DUPLICATE_TYPE_INSTANCE(state, payload: { typeName: string, instanceId: string }) {
      registerInstancesMutation(state)
      const { typeName, instanceId } = payload
      const uniqueInstanceId = utils.getUniqueInstanceId(state)

      const source = state.project.instances[typeId].definition[instanceId]

      let instance = Object.keys(source).reduce((acc, propName) => {
        if (propName.includes('meta') || propName === 'id') {
          return acc
        }
        const prop = source[propName]
        acc[propName] = utils.getInstanceProp(prop.valueType, prop.name, prop.values, prop.isArray)
        return acc
      }, {} as Instance)

      instance = {
        ...utils.getNewInstanceData(state, typeName, uniqueInstanceId),
        ...instance
      }

      state.project.instances[typeId].definition[uniqueInstanceId] = instance
    },
    UPDATE_INSTANCE_PROPERTY(state, payload: { newProp: InstanceProp, typeName: string, instanceId: string }) {
      registerInstancesMutation(state)

      const prop = state.project.instances[payload.typeName][payload.instanceId][payload.newProp.name]
      prop.values = payload.newProp.values
    },
    REMOVE_TYPE_INSTANCE(state, payload: { typeName: string, instanceId: string }) {
      registerInstancesMutation(state)

      delete state.project.instances[payload.typeName][payload.instanceId]
    },
    ADD_INSTANCE_OUTBOUND_REFERENCE_META(state, payload: { typeName: string, instanceId: string, referencedId: string }) {
      registerInstancesMutation(state)
      const { typeName, instanceId, referencedId } = payload

      // Remember what instance we are referencing
      state.project.instances[typeId].definition[instanceId].meta_isReferencing.values.push(referencedId)
      // Now tell that instance that we reference it
      Object.entries(state.project.instances).some((tuple1) => {
        if (referencedId in tuple1[1]) { // find that instance first
          tuple1[1][referencedId].meta_isReferencedBy.values.push(instanceId) // add meta-data about reference
          return true // stop "some" after first finding
        }
        return false // continue "some"
      })
    },
    REMOVE_INSTANCE_OUTBOUND_REFERENCE_META(state, payload: { typeName: string, instanceId: string, referencedId: string }) {
      registerInstancesMutation(state)
      const { typeName, instanceId, referencedId } = payload

      // Forget referenced instance
      const isReferencing = state.project.instances[typeId].definition[instanceId].meta_isReferencing
      isReferencing.values = [
        ...isReferencing.values.filter((rId) => rId !== referencedId)
      ]
      // Now tell referenced instance that we no longer reference it
      Object.entries(state.project.instances).some((tuple1) => {
        if (referencedId in tuple1[1]) {
          const isReferencedBy = state.project.instances[typeId].definition[referencedId].meta_isReferencing
          isReferencedBy.values = [
            ...isReferencedBy.values.filter((rId) => rId !== instanceId)
          ]
          return true
        }
        return false
      })
    },
    REMOVE_ALL_INSTANCE_OUTBOUND_REFERENCES_META(state, payload: { typeName: string, instanceId: string }) {
      registerInstancesMutation(state)
      const { typeName, instanceId } = payload

      ;(state.project.instances[typeId].definition[instanceId].meta_isReferencing.values as string[]).forEach((irId) => {
        Object.entries(state.project.instances).some((tuple1) => {
          if (irId in tuple1[1]) {
            const isReferencedBy = tuple1[1][irId].meta_isReferencedBy
            isReferencedBy.values = {
              ...isReferencedBy.values.filter((irbId) => irbId !== instanceId)
            }
            return true
          }
          return false
        })
      })
    },
    // This also removes values from properties of instances that were referencing given instance
    REMOVE_ALL_INSTANCE_INBOUND_REFERENCES(state, payload: { typeName: string, instanceId: string }) {
      registerInstancesMutation(state)
      const { typeName, instanceId } = payload

      ;(state.project.instances[typeId].definition[instanceId].meta_isReferencedBy.values as string[]).forEach((irbId) => {
        Object.entries(state.project.instances).some((tuple1) => {
          if (irbId in tuple1[1]) {
            const isReferencing = tuple1[1][irbId].meta_isReferencing
            isReferencing.values = {
              ...isReferencing.values.filter((irId) => irId !== instanceId)
            }
            const referencingProperties = Object.entries(state.project.types[tuple1[0]]).filter((tuple2) => {
              return tuple2[1]?.refTargetType === typeName
            })
            referencingProperties.forEach((propNameTuple) => {
              tuple1[1][irbId][propNameTuple[0]].values = [
                ...tuple1[1][irbId][propNameTuple[0]].values.filter((v) => v !== instanceId)
              ]
            })
            return true
          }
          return false
        })
      })

      state.project.instances[typeId].definition[instanceId].meta_isReferencedBy.values = []
    },
  },
  actions: {
    createType() {
      this.commit('CREATE_TYPE')
    },
    renameType(state, payload: { oldTypeName: string, newTypeName: string }) {
      this.commit('RENAME_TYPE', payload)
    },
    removeType(state, typeName: string) {
      this.commit('REMOVE_TYPE', typeName)
    },
    createTypeProperty(state, typeName: string) {
      this.commit('CREATE_TYPE_PROPERTY', typeName)
    },
    updateTypeProperty(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      this.commit('UPDATE_TYPE_PROPERTY', payload)
    },
    removeTypeProperty(state, payload: { propName: string, typeName: string }) {
      this.commit('REMOVE_TYPE_PROPERTY', payload)
    },
    moveTypePropertyUp(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('MOVE_TYPE_PROPERTY_UP', payload)
    },
    moveTypePropertyDown(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('MOVE_TYPE_PROPERTY_DOWN', payload)
    },
    createInstance(state, typeName: string) {
      this.commit('CREATE_TYPE_INSTANCE', typeName)
    },
    duplicateInstance(state, payload: { typeName: string, instanceId: string }) {
      this.commit('DUPLICATE_TYPE_INSTANCE', payload)
    },
    updateInstanceProperty(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('UPDATE_INSTANCE_PROPERTY', payload)
    },
    removeInstance(state, payload: { typeName: string, instanceId: string }) {
      const { typeName, instanceId } = payload

      // Remove all references to the instance from other instance together with values
      // from properties that were source of the reference
      state.dispatch('removeAllInstanceInboundReferences', { typeName, instanceId })

      // Here we remove references to every instance this instance was referencing and tell every
      // referenced instance that we don't reference it any more
      state.dispatch('removeAllInstanceReferencesMeta', { typeName, instanceId })

      this.commit('REMOVE_TYPE_INSTANCE', payload)
    },
    addInstanceOutboundReferenceMeta(state, payload: { typeName: string, instanceId: string, referencedId: string }) {
      this.commit('ADD_INSTANCE_OUTBOUND_REFERENCE_META', payload)
    },
    removeInstanceOutboundReferenceMeta(state, payload: { typeName: string, instanceId: string, referencedId: string }) {
      this.commit('REMOVE_INSTANCE_OUTBOUND_REFERENCE_META', payload)
    },
    removeAllInstanceOutboundReferencesMeta(state, payload: { typeName: string, instanceId: string }) {
      this.commit('REMOVE_ALL_INSTANCE_OUTBOUND_REFERENCES_META', payload)
    },
    removeAllInstanceInboundReferences(state, payload: { typeName: string, instanceId: string }) {
      this.commit('REMOVE_ALL_INSTANCE_INBOUND_REFERENCES', payload)
    },
  },
});
