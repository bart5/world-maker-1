<template>
  <div class="frame-wrapper">
    <div class="top-bar">
    </div>
    <div class="workspace-board">
      <div class="workspace-selector">
      </div>
        <div class="workspace"
          @click="onWorkspaceClick"
        >
          <!-- tiles.. -->
          <Tile/>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Tile from '@/views/Tile.vue'

@Options({
  components: {
    Tile
  },
})
export default class Frame extends Vue {
  createTile() {

  }

  activeWorkspace() {

  }

  selectWorkspace() {

  }

  newWorkspace() {

  }

  onWorkspaceClick(event: MouseEvent) {

  }

}
</script>

<style lang="scss">
.frame-wrapper {
  width: 100%;
  height: 100%;
  max-height: 100%;
  border: 3px solid purple;
  display: flex;
  flex-flow: column nowrap;
}

.top-bar {
  width: 100%;
  height: 24px;
  background-color: darkgray;
}

.workspace-board {
  border: 2px dashed;
  height: 100%;
}

.workspace-selector {
  height: 14px;
  border: 2px solid darkmagenta;
  width: 100%;
}

.workspace {
  position: relative;
}
</style>
