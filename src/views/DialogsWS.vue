<template>
  <div class="workspace-wrapper">
    <div class="top-bar">
      <button :disabled="!activeWorkspace" @click="createNewDialog">New dialog</button>
      <button :disabled="!activeWorkspace" @click="removeDialog">Remove dialog</button>
      <select class="" :value="selectedDialogId" v-model="selectedDialogId">
        <option v-for="dialog in filteredDialogs" :key="dialog.id[0]" :value="dialog.id[0]">{{ dialog.name[0] || dialog.id[0] }}</option>
      </select>
    </div>
    <Board v-if="boardId !== ''" :boardId="boardId" />
    <div v-else>No board to show</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import Board from '@/views/Board.vue';
import { actions } from '@/store/transactions'

@Options({
  components: {
    Board
  },
})
export default class DialogsWS extends Vue {
  selectedDialogId = ''

  boardId = ''

  @Watch('selectedDialogId')
  updateBoardId() {
    this.boardId = this.selectedDialogId
  }

  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  get filteredDialogs(): Instance[] {
    return this.$store.getters.getFilteredInstances({ tId: 'dialog' })
  }

  createNewDialog() {
    actions.createInstance({ tId: 'dialog' })
  }

  removeDialog() {
    actions.removeInstance({ tId: 'dialog', iId: this.selectedDialogId })
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
