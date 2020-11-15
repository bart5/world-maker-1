import { Vue } from 'vue-class-component'
import { Store } from 'vuex'
import * as utils from './utils'

export const transactionHandler = {
  store: {} as Store<ApplicationState>,
  init(vm: Vue) {
    this.store = vm.$store
  },
  mutate(
    mN: string | null, // mutation name
    args: MutArgs,
    eT: EntityType,
    tId: string, // type id
    iId = '', // instance id
    pN = '', // prop name
    newName = '' // it's needed for renaming props
  ) {
    let entity
    let entityCopy
    if (eT === 'TypeWrapper') {
      entity = this.store.state.project.types[tId] as TypeWrapper
      entityCopy = !entity ? null : utils.copyTypeWrapper(entity)
    } else if (eT === 'PropDefinition') {
      entity = this.store.state.project.types[tId].definition[pN] as PropDefinition
      entityCopy = !entity ? null : utils.copyPropDef(entity)
    } else if (eT === 'Instance') {
      entity = this.store.state.project.instances[tId][iId] as Instance
      entityCopy = !entity ? null : utils.copyInstance(entity)
    } else /* (eT === 'PropValues') */ {
      entity = this.store.state.project.instances[tId][iId][pN] as PropValues
      entityCopy = !entity ? null : utils.copyPropValues(entity)
    }
    this.registerChange(entityCopy, eT, tId, iId, pN, newName)

    // This is slightly contradictory with the name of this method
    if (mN !== null) {
      this.store.commit(mN, { tId, iId, pN, ...args })
    }
  },
  act(actionType: ActionType, context: PublicActionContext) {
    this.store.dispatch('publicAction', { actionType, context })
  },
  registerChange(
    entityCopy: TypeWrapper | PropDefinition | Instance | PropValues | null,
    entityType: EntityType,
    tId: string,
    iId = '',
    pN = '',
    newName = ''
  ) {
    if (!this.store.state.currentTransaction) return

    this.store.state.currentTransaction.changes.push({
      entityBefore: entityCopy,
      entityType,
      tId,
      iId,
      pN,
      newName
    })
  },
  /**
   * We assume that changes can only be reverted
   * one by one. You cannot jump to arbitrary change
   * in the past and revert only that change.
   */
  revertChange(change: Change) {
    const state = this.store.state
    let entity
    switch (change.entityType) {
      case 'TypeWrapper': // tId
        entity = change.entityBefore as TypeWrapper
        if (entity === null) {
          delete state.project.types[change.tId]
        } else {
          state.project.types[change.tId] = entity
          if (!state.project.instances[change.tId]) {
            state.project.instances[change.tId] = {}
          }
        }
        break;
      case 'PropDefinition': // tId, pN
        entity = change.entityBefore as PropDefinition
        if (entity === null) {
          delete state.project.types[change.tId].definition[change.pN]
        } else {
          state.project.types[change.tId].definition[change.pN] = entity
        }
        break;
      case 'Instance': // tId, iId
        entity = change.entityBefore as Instance
        if (entity === null) {
          delete state.project.instances[change.tId][change.iId]
        } else {
          state.project.instances[change.tId][change.iId] = entity
        }
        break;
      case 'PropValues': // tId, iId, pN
        entity = change.entityBefore as PropValues
        if (entity === null) {
          delete state.project.instances[change.tId][change.iId][change.pN]
        } else {
          state.project.instances[change.tId][change.iId][change.pN] = entity
          if (change.newName) {
            delete state.project.instances[change.tId][change.iId][change.newName]
          }
        }
        break;
      default:
        Error(`Unknown entity type of the change: ${change.entityType}.`)
    }
  }
}

function act(actionType: ActionType, ctx: PublicActionContext) {
  transactionHandler.act(actionType, ctx)
}

export const actions: { [k in ActionType]: (ctx: PublicActionContext) => void } = {
  createType: (ctx) => act('createType', ctx),
  removeType: (ctx) => act('removeType', ctx),
  renameType: (ctx) => act('renameType', ctx),
  createProp: (ctx) => act('createProp', ctx),
  removeProp: (ctx) => act('removeProp', ctx),
  renameProp: (ctx) => act('renameProp', ctx),
  movePropUp: (ctx) => act('movePropUp', ctx),
  movePropDown: (ctx) => act('movePropDown', ctx),
  changePropType: (ctx) => act('changePropType', ctx),
  changePropToArray: (ctx) => act('changePropToArray', ctx),
  changePropToSingle: (ctx) => act('changePropToSingle', ctx),
  changePropTargetType: (ctx) => act('changePropTargetType', ctx),
  changePropValue: (ctx) => act('changePropValue', ctx),
  addPropValue: (ctx) => act('addPropValue', ctx),
  removePropValue: (ctx) => act('removePropValue', ctx),
  createInstance: (ctx) => act('createInstance', ctx),
  removeInstance: (ctx) => act('removeInstance', ctx),
}

export function revertChange(change: Change) {
  transactionHandler.revertChange(change)
}

export function mutate(
  mN: string | null, // mutation name
  args: MutArgs,
  eT: EntityType,
  tId: string, // type id
  iId = '', // instance id
  pN = '' // prop name
) {
  transactionHandler.mutate(mN, args, eT, tId, iId, pN)
}

export default transactionHandler
