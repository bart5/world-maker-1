<template>
  <div class="workspace-wrapper">
    <!-- <div class="top-bar">
      <button @click="createNewEntity">{{ `New ${entityName}` }}</button>
      <button @click="removeEntity">{{ `New ${entityName}` }}</button>
      <select class="" :value="selectedEntityId" @change="updateBoardId(selectedEntityId)">
        <option v-for="entity in filteredEntities" :key="entity.id[0]" :value="entity.id[0]">
          {{ entity.name[0] || entity.id[0] }}
        </option>
      </select>
    </div> -->
    <div>Awesome table</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
// import { actions } from '@/store/transactions'

@Options({
  components: {
  },
})
export default class TableWS extends Vue {
  @Prop() workspaceId!: string

  selectedEntityId = ''

  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  // get filteredEntities(): Instance[] {
  //   return this.$store.getters.getFilteredInstances(this.simpCtx)
  // }

  // createNewEntity() {
  //   actions.createInstance(this.simpCtx)
  // }

  // removeEntity() {
  //   const decision1 = window.confirm(`You are about to delete this ${this.entityName}. Are you sure?`)
  //   if (!decision1) return
  //   else {
  //     const decision2 = window.confirm('Do you want to remove also contained entities?')
  //     if (decision2) {
  //       this.removeAllTiles()
  //     }
  //   }
  //   actions.removeInstance(this.simpCtx)
  //   this.updateBoardId('')
  // }

  // removeAllTiles() {
  //   const tiles: Tile[] = this.$store.getters.getBoardTiles(this.boardId)
  //   tiles.forEach((tile) => {
  //     actions.removeInstance({ tId: tile.type, iId: tile.id, boardId: this.boardId, tileType: tile.type })
  //   })
  // }

  // get simpCtx() {
  //   return {
  //     tId: this.entityTypeId,
  //     iId: this.selectedEntityId,
  //     boardId: this.boardId,
  //     tileType: this.tileType
  //   }
  // }
}
</script>

<style lang="scss" scoped>
.workspace-wrapper {
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-flow: column nowrap;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.top-bar {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  height: 24px;
  background-color: darkgray;

  .widget {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: black;

    .workspace-modulus {
      width: 42px;
    }
  }
}
</style>
