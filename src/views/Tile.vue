<template>
  <div
    class="tile-wrapper"
    ref="tileWrapper"
    :style="tileStyle"
    @mousedown="() => { bringTileForward() }"
    :class="{'connection-ready': indicateConnectionReady, 'de-emphasize': deEmphasize}"
  >
    <div
      class="inner-wrapper"
      @mousedown="() => { tryConnect() }"
    >
      <div class="header" :class="{'move-ready': !connectingInProgress}" @mousedown="startDrag">
        <button class="connect-button" @click="startConnecting" :class="{'connect-ready': !connectingInProgress}">
          <img src="../assets/connector.svg" alt="">
        </button>
      </div>
      <div class="tile">
        <!-- <component :is="TaskEditor"></component> -->
      </div>
      <div class="footer" @mousedown="startResize">
        <div class="resize-widget" :class="{'resize-ready': !connectingInProgress}"></div>
      </div>
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

  TaskEditor = TaskEditor

  resizeInProgress = false

  dragInProgress = false

  get self(): Tile {
    return this.$store.getters.tileOfId(this.id)
  }

  get indicateConnectionReady() {
    return this.connectingInProgress && !this.hasConnectedInput && !this.isSelectedInputSource
  }

  get deEmphasize() {
    return this.connectingInProgress && (
      this.hasConnectedInput
      /* No cylic connections */
      || this.isConnectedWithSelectedInputSource
      || this.isSelectedInputSource
    )
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

  startConnecting(e: MouseEvent) {
    if (this.connectingInProgress) return
    this.$store.dispatch('startConnectingTiles', this.id)
    this.startMousemoveListener()
    this.$emit('connecting', e)
  }

  tryConnect() {
    if (this.connectingInProgress) {
      this.$store.dispatch('connectToThisTile', this.id)
      this.$store.dispatch('stopConnectingTiles')
      this.stopMousemoveListener()
    }
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

  onMouseMove(e: MouseEvent) {
    if (this.resizeInProgress) {
      this.resizeHandler(e)
    } else if (this.dragInProgress) {
      this.dragHandler(e)
    }
  }

  getMovedByDelta(p: { x: number, y: number }, delta: { x: number, y: number }) {
    return {
      x: p.x + delta.x,
      y: p.y + delta.y,
    }
  }

  getMouseMoveDelta(e: MouseEvent) {
    return {
      x: e.movementX * (1 / this.scale),
      y: e.movementY * (1 / this.scale)
    }
  }

  resizeHandler(e: MouseEvent) {
    this.$store.dispatch('resizeTile', { tileId: this.id, delta: this.getMouseMoveDelta(e) })
  }

  dragHandler(e: MouseEvent) {
    this.$store.dispatch('dragTile', { tileId: this.id, delta: this.getMouseMoveDelta(e) })
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
  border: 2px solid;
  background: white;
  border-radius: 10px;
  overflow: hidden;

  &.de-emphasize * {
    opacity: 0.7;
  }
  &.connection-ready:not(.de-emphasize):hover {
    cursor: pointer;
  }
}

.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 18px;
  background: black;
  box-shadow:
    inset 20px 0 20px 1px rgba(255,255,255,0.25),
    inset 0px 2px 12px 3px blue;

  &.move-ready:hover {
    cursor: move;
  }

  * {
    max-height: 14px;
  }

  .connect-button:not(.connect-ready) {
    &:hover {
      cursor: initial;
      &:not(:active) {
        background-color: unset;
      }
    }
    &:active {
      background-color: unset;
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

    &.resize-ready:hover {
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
