import { Vue } from 'vue-class-component'
import { Store } from 'vuex'
import * as utils from './utils'
import { typesWithBoards } from './builtInData'

export const transactionHandler = {
  store: {} as Store<ApplicationState>,
  init(vm: Vue) {
    this.store = vm.$store
  },
  transactionStoreLimit: 200,
  makeSnapshot(
    eT: EntityType,
    tId: string, // type id
    iId = '', // instance id
    pN = '', // prop name
    newName = '', // it's needed for renaming props
    initial = false,
    boardId = '',
    tileType: TileType = '',
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
    this.registerChange(entityCopy, eT, tId, iId, pN, newName, initial, boardId, tileType)
  },
  mutate(
    mN: string | null, // mutation name
    args: MutArgs,
    eT: EntityType,
    tId: string, // type id
    iId = '', // instance id
    pN = '', // prop name
    newName = '', // it's needed for renaming props
    boardId = '',
    tileType: TileType = ''
  ) {
    // Make first snapshot if there is none
    const recentChanges = this.store.state.project.recentChanges
    const hasPastState = recentChanges.last().changes.some((c) => {
      return c.entityType === eT && c.tId === tId && c.iId === iId && c.pN === pN
    })
    if (!hasPastState || recentChanges.last().actionType === 'initialState') {
      this.makeSnapshot(eT, tId, iId, pN, newName, true)
    }

    // This is slightly contradictory with the name of this method
    if (mN !== null) {
      this.store.commit(mN, { tId, iId, pN, ...args })
    }
    this.makeSnapshot(eT, tId, iId, pN, newName, false, boardId, tileType)
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
    newName = '',
    initial = false,
    boardId = '',
    tileType: TileType = ''
  ) {
    const state = this.store.state

    const transaction = initial ? state.project.recentChanges.last() : state.currentTransaction

    if (!transaction) {
      console.error('Tried to register change with no existing transaction.')
      return
    }

    if (transaction.changes.length === this.transactionStoreLimit) {
      transaction.changes.splice(0, 1)
    }

    state.ui.lastRevertedTransactions = []

    transaction.changes.push({
      entityBefore: entityCopy,
      entityType,
      tId,
      iId,
      pN,
      newName,
      boardId,
      tileType,
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
          this.store.dispatch('deleteTile', { boardId: 'types', tileId: change.tId })
        } else {
          state.project.types[change.tId] = entity
          if (!state.project.uiData.boards.types.tiles.some((t) => t.id === change.tId)) {
            this.store.dispatch('createNewTile', { boardId: 'types', type: 'type', id: change.tId })
          }
          // Prepare container for instances
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
          if (typesWithBoards.includes(change.tId)) {
            this.store.dispatch('deleteBoard', change.iId)
          }
        } else {
          state.project.instances[change.tId][change.iId] = entity
          if (typesWithBoards.includes(change.tId)) {
            if (!(change.iId in state.project.uiData.boards)) {
              this.store.dispatch('createBoard', change.iId)
            }
          } else if (change.tileType) {
            if (!state.project.uiData.boards.types.tiles.some((t) => t.id === change.iId)) {
              this.store.dispatch('createNewTile', { boardId: change.boardId, type: change.tileType, id: change.iId })
            }
          }
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
  },
  revertTransaction(t: Transaction, direction: 'backward' | 'forward') {
    if (direction === 'backward') {
      for (let i = t.changes.length - 1; i >= 0; i--) {
        this.revertChange(t.changes[i])
      }
    } else {
      for (let i = 0; i < t.changes.length; i++) {
        this.revertChange(t.changes[i])
      }
    }
  },
  revertTo(id?: string) {
    const state = this.store.state
    if (state.project.recentChanges.last().id === 'initialState') return
    if (id && !state.project.recentChanges.find((t) => t.id === id)) {
      console.error('No such change to revert to.')
      return
    }

    const currentState = state.project.recentChanges.pop()
    if (!currentState) return

    state.ui.lastRevertedTransactions.unshift(currentState)

    const previousState = state.project.recentChanges.last()

    this.revertTransaction(previousState, 'backward')

    // If our id is very last then we stop
    if (id && state.project.recentChanges.last().id !== id) {
      this.revertTo(id)
    }
  },
  unRevertTo(id?: string) {
    const state = this.store.state
    if (id && !state.ui.lastRevertedTransactions.find((t) => t.id === id)) {
      console.error('No such change to un-revert to.')
      return
    }

    const lastRevertedTransaction = state.ui.lastRevertedTransactions.shift()
    if (!lastRevertedTransaction) return

    state.project.recentChanges.push(lastRevertedTransaction)

    this.revertTransaction(lastRevertedTransaction, 'forward')

    if (id && state.ui.lastRevertedTransactions.find((t) => t.id === id)) {
      this.unRevertTo(id)
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

export function revertTo(id?: string) {
  transactionHandler.revertTo(id)
}

export function unRevertTo(id?: string) {
  transactionHandler.unRevertTo(id)
}

export function mutate(
  mN: string | null, // mutation name
  args: MutArgs,
  eT: EntityType,
  tId: string, // type id
  iId = '', // instance id
  pN = '', // prop name,
  boardId = '',
  tileType = '',
) {
  transactionHandler.mutate(mN, args, eT, tId, iId, pN, boardId, tileType)
}

export default transactionHandler
