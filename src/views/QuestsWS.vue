<template>
  <div class="workspace-wrapper">
    <div class="top-bar">
      <button @click="createNewEntity">{{ `New ${entityName}` }}</button>
      <button @click="removeEntity">{{ `New ${entityName}` }}</button>
      <select class="" v-model="selectedEntityId">
        <option v-for="entity in filteredEntities" :key="entity.id[0]" :value="entity.id[0]">{{ entity.name[0] || entity.id[0] }}</option>
      </select>
    </div>
    <Board v-if="boardId !== ''" :boardId="boardId" />
    <div v-else>No board to show</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Board from '@/views/Board.vue';
import { actions } from '@/store/transactions'

@Options({
  components: {
    Board
  },
})
export default class QuestsWS extends Vue {
  @Prop() entityName!: string
  @Prop() entityTypeId: string = this.entityName

  selectedEntityId = ''

  boardId = ''

  @Watch('selectedEntityId')
  updateBoardId() {
    this.boardId = this.selectedEntityId
  }

  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  get filteredEntities(): Instance[] {
    return this.$store.getters.getFilteredInstances(this.simpCtx)
  }

  createNewEntity() {
    actions.createInstance(this.simpCtx)
  }

  removeEntity() {
    actions.removeInstance(this.simpCtx)
  }

  get simpCtx() {
    return {
      tId: this.entityTypeId,
      iId: this.selectedEntityId,
    }
  }

  mounted() {
    this.boardId = this.activeWorkspace.activeBoardId
  }
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
