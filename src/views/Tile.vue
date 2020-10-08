<template>
  <div
    class="tile-wrapper"
    ref="tileWrapper"
    :style="tileStyle"
    @mousedown="bringTileForward"
    :class="{'valid-connection': indicateValidConnection, 'invalid-connection': indicateInvalidConnection}"
  >
    <div v-if="connectingInProgress" class="overlay connect-overlay" @mousedown="tryConnect"></div>
    <div v-if="tileDeletionInProgress" class="overlay delete-overlay" @click="tryDelete">
      <div class="text">Delete</div>
    </div>
    <div class="header-wrapper">
      <div class="header" @mousedown="startDrag">
        <button class="connect-button" @click="startConnecting">
          <img src="../assets/connector.svg" alt="">
        </button>
        <div class="tile-title">Title</div>
      </div>
      <div class="sub-header">
        <div class="data-view">Data</div>
        <div class="filter-view">Filters</div>
        <div class="source-view">Sources</div>
      </div>
    </div>
    <div class="tile">
      <!-- <component :is="TaskEditor"></component> -->
    </div>
    <div class="footer" @mousedown="startResize">
      <div class="resize-widget"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TaskEditor from '@/views/TaskEditor.vue'
import { Prop } from 'vue-property-decorator'

@Options({
  components: {
    TaskEditor,
  },
})
export default class TileComponent extends Vue {
  @Prop() id!: string

  @Prop() scale!: number

  @Prop() relativeMousePosition!: {
    x: number,
    y: number,
  }

  TaskEditor = TaskEditor

  resizeInProgress = false

  dragInProgress = false

  get indicateValidConnection() {
    return this.connectingInProgress && this.isValidConnectionCandidate
  }

  get indicateInvalidConnection() {
    return this.connectingInProgress && !this.isValidConnectionCandidate
  }

  get self(): Tile {
    return this.$store.getters.tileOfId(this.id)
  }

  get isValidConnectionCandidate() {
    return !this.hasConnectedInput && !this.isConnectedWithSelectedInputSource && !this.isSelectedInputSource
  }

  get isConnectedWithSelectedInputSource() {
    return this.selectedInputSourceTile.inputSource === this.id
  }

  get hasConnectedInput() {
    return this.self.inputSource !== ''
  }

  get selectedInputSourceTile(): Tile {
    return this.$store.getters.selectedInputSourceTile
  }

  get isSelectedInputSource() {
    return this.selectedInputSourceTile.id === this.id
  }

  get connectingInProgress() {
    return this.$store.getters.connectingInProgress
  }

  get tileDeletionInProgress() {
    return this.$store.getters.tileDeletionInProgress
  }

  startConnecting(e: MouseEvent) {
    if (this.connectingInProgress) return
    this.$store.dispatch('startConnectingTiles', this.id)
    this.startMousemoveListener()
    this.$emit('connecting', e)
  }

  tryConnect(e: MouseEvent) {
    if (this.isValidConnectionCandidate) {
      this.$store.dispatch('connectToThisTile', this.id)
      this.$store.dispatch('stopConnectingTiles')
      this.stopMousemoveListener()
    } else {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  tryDelete() {
    const decision = window.confirm('You are about to permanently delete this tile.')
    if (decision) {
      this.deleteTile()
    }
  }

  deleteTile() {
    this.$store.dispatch('deleteTile', this.id)
  }

  startMousemoveListener(onMouseUp?: (...args: []) => void) {
    window.addEventListener('mousemove', this.onMouseMove)
    if (onMouseUp) {
      window.addEventListener('mouseup', () => {
        onMouseUp()
        this.stopMousemoveListener()
      })
    }
  }

  stopMousemoveListener() {
    window.removeEventListener('mousemove', this.onMouseMove)
  }

  startDrag() {
    if (this.connectingInProgress) return
    this.dragInProgress = true
    this.$emit('start-drag')
    this.startMousemoveListener(() => {
      this.dragInProgress = false
      this.$emit('stop-drag')
    })
  }

  startResize() {
    if (this.connectingInProgress) return
    this.resizeInProgress = true
    this.$emit('start-resize')
    this.startMousemoveListener(() => {
      this.resizeInProgress = false
      this.$emit('stop-resize')
    })
  }

  onMouseMove() {
    if (this.resizeInProgress) {
      this.resizeHandler()
    } else if (this.dragInProgress) {
      this.dragHandler()
    }
  }

  resizeHandler() {
    this.$store.dispatch('resizeTile', { tileId: this.id, newPosition: this.relativeMousePosition })
  }

  dragHandler() {
    this.$store.dispatch('dragTile', { tileId: this.id, newPosition: this.relativeMousePosition })
  }

  get tileStyle() {
    const { width, height, x, y, zIndex } = this.self

    return {
      width: width + 'px',
      height: height + 'px',
      left: x + 'px',
      top: y + 'px',
      zIndex,
    }
  }

  bringTileForward() {
    this.$store.dispatch('bringTileForward', this.id)
  }
}
</script>

<style lang="scss" scoped>
.tile-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  height: 200px;
  width: 100px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: darkblue 1px 1px 5px 1px;
  display: flex;
  flex-flow: column nowrap;
  z-index: 1;

  * {
    transition: opacity 0.25s;
  }
  &.invalid-connection {
    &:hover {
      cursor: not-allowed;
    }
    * {
    opacity: 0.7;
    }
  }
  &.valid-connection:not(.de-emphasize):hover {
    cursor: pointer;
  }
}

.overlay {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 2;
}

.delete-overlay {
  background: rgba(255,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;

  .text {
    display: block;
    font-size: 20px;
    color: black;
    font-weight: bold;
  }

  &:hover {
    cursor: pointer;
    background: rgba(255,0,0,0.7);
  }
}

.header-wrapper {
  background: black;
  box-shadow:
    inset 20px 0px 60px 2px rgba(255,255,255,0.25),
    inset 0px 2px 23px 3px blue;
}

.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 20px;
  max-height: 20px;

  &:hover {
    cursor: move;
  }

  .connect-button {
    height: 18px;
    position: absolute;

    img {
      height: 14px;
    }
  }

  .tile-title {
    color: white;
    text-align: center;
    flex-grow: 1;
    user-select: none;
  }
}

.sub-header {
  box-shadow:
    inset 0 0 3px 0 rgba(255,255,255,0.4),
    0 0 3px 1px blue;
  height: 18px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-evenly;
  align-items: center;
  color: white;
  font-size: 12px;

  * {
    text-align: center;
    width: 100%;
    user-select: none;

    &:hover {
      background-color: rgba(255,255,255,0.10);
      cursor: pointer;
    }
  }
}

.footer {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  height: 8px;
  background: black;
  box-shadow:
    inset 15px 0 10px 1px rgba(255,255,255,0.25),
    inset 0px -2px 6px 1px blue;

  .resize-widget {
    height: 100%;
    width: 15px;
    background-color: red;

    &:hover {
      cursor: se-resize;
    }
  }
}

.tile {
  height: 100%;
  overflow: auto;
}

.inner-wrapper {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 1;
}
</style>
