<template>
  <div class="workspace-wrapper">
    <div class="top-bar">
      <button :disabled="!activeWorkspace" @click="createNewQuest">New quest</button>
      <button :disabled="!activeWorkspace" @click="removeQuest">Remove quest</button>
      <select class="" :value="selectedQuestId" v-model="selectedQuestId">
        <option v-for="quest in filteredQuests" :key="quest.id[0]" :value="quest.id[0]">{{ quest.name[0] }}</option>
      </select>
    </div>
    <Board :boardId="boardId" />
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
export default class QuestsWS extends Vue {
  selectedQuestId = ''

  boardId = ''

  @Watch('selectedQuestId')
  updateBoardId() {
    this.boardId = this.selectedQuestId
  }

  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  get filteredQuests(): Instance[] {
    return this.$store.getters.getFilteredInstances({ tId: 'quest' })
  }

  createNewQuest() {
    actions.createInstance({ tId: 'quest' })
  }

  removeQuest() {
    actions.createInstance({ tId: 'quest' })
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
