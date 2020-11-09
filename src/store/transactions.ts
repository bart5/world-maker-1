import { Vue } from 'vue-class-component'
import { Store } from 'vuex'
import * as utils from './utils'

export const transactionHandler = {
  store: {} as Store<ApplicationState>,
  init(vm: Vue) {
    this.store = vm.$store
  },
  act(changeType: ChangeType, context: any) {
    this.store.dispatch('publicAction', { changeType, context })
  },
  mutate(
    mN: string | null, // mutation name
    args: MutArgs,
    eT: EntityType,
    tId: string, // type id
    iId = '', // instance id
    pN = '' // prop name
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
    this.registerChange(entityCopy, eT, tId, iId, pN)

    // This is slightly contradictory with the name of this method
    if (mN !== null) {
      this.store.commit(mN, { tId, iId, pN, ...args })
    }
  },
  registerChange(
    entityCopy: TypeWrapper | PropDefinition | Instance | PropValues | null,
    entityType: EntityType,
    tId: string,
    iId = '',
    pN = ''
  ) {
    if (!this.store.state.currentTransaction) return

    this.store.state.currentTransaction.changes.push({
      entityBefore: entityCopy,
      entityType,
      tId,
      iId,
      pN
    })
  }
}

export function act(changeType: ChangeType, context: any) {
  transactionHandler.act(changeType, context)
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
