<template>
  <div class="workspace-wrapper">
    <div class="top-bar">
      <button :disabled="!activeWorkspace" @click="createNewType">Create new type</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Board from '@/components/Board.vue';
import { actions } from '@/store/transactions'

@Options({
  components: {
    Board
  },
})
export default class TablesWS extends Vue {
  deleteModeIsOn = false

  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  get boardId() {
    return this.activeWorkspace.activeBoardId
  }

  createNewType() {
    actions.createType({})
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
