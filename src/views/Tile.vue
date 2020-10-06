<template>
  <div
    class="tile-wrapper"
    ref="tileWrapper"
    :style="tileStyle"
    @mousedown="() => { bringTileForward() }"
  >
    <Curve
      class="curve"
      v-if="hasConnection || connectingInProgress"
      :p1="offsetByTileOrigin(getTileCenter(self))"
      :p2="connectingInProgress ? mousePosition : offsetByTileOrigin(getTileCenter(inputSourceTile))"
    />
    <div class="insulator" :class="{ connectable: connectingInProgress }" @mousedown="() => { tryConnect() }">
      <div class="header" @mousedown="startDrag">
        <button @click="startConnecting">
          <img src="../assets/connector.svg" alt="">
        </button>
      </div>
      <div class="tile">
        <component :is="TaskEditor"></component>
      </div>
      <div class="footer" @mousedown="startResize">
        <div class="resize-widget"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TaskEditor from '@/views/TaskEditor.vue'
import Curve from '@/views/Curve.vue'
import { Prop } from 'vue-property-decorator'

@Options({
  components: {
    TaskEditor,
    Curve
  },
})
export default class TileComponent extends Vue {
  @Prop() id!: string

  TaskEditor = TaskEditor

  resizeInProgress = false

  dragInProgress = false

  mousePosition = {
    x: 0,
    y: 0,
  }

  get self(): Tile {
    return this.$store.getters.tileById(this.id)
  }

  offsetByTileOrigin(point: { x: number, y: number }) {
    return {
      x: point.x - this.self.x,
      y: point.y - this.self.y,
    }
  }

  getTileCenter(tile: Tile): { x: number, y: number } {
    return {
      x: tile.x + tile.width * 0.5,
      y: tile.y + tile.height * 0.5
    }
  }

  startConnecting(e: MouseEvent) {
    this.saveMousePosition(e)
    this.$store.dispatch('startConnectingTiles', this.id)
    this.startMousemoveListener()
  }

  tryConnect() {
    if (this.connectingInProgress) {
      this.$store.dispatch('connectToThisTile', this.id)
      this.$store.dispatch('stopConnectingTiles')
      this.stopMousemoveListener()
    }
  }

  get hasConnection() {
    return this.self.inputSource !== ''
  }

  get inputSourceTile() {
    return this.$store.getters.tileById(this.self.inputSource)
  }

  get connectingInProgress() {
    return this.$store.getters.connectingInProgress
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
    this.dragInProgress = true
    this.startMousemoveListener(() => {
      this.dragInProgress = false
    })
  }

  startResize() {
    this.resizeInProgress = true
    this.startMousemoveListener(() => {
      this.resizeInProgress = false
    })
  }

  onMouseMove(e: MouseEvent) {
    console.log('on mouse move')
    if (this.resizeInProgress) {
      this.resizeHandler(e)
    } else if (this.dragInProgress) {
      this.dragHandler(e)
    } else if (this.connectingInProgress) {
      console.log('saving mouse position')
      // this.saveMousePosition(e)
      this.mousePosition = this.getMovedByDelta(this.mousePosition, this.getMouseMoveDelta(e))
    }
  }

  getMovedByDelta(p: { x: number, y: number }, delta: { x: number, y: number }) {
    return {
      x: p.x + delta.x,
      y: p.y + delta.y,
    }
  }

  saveMousePosition(e: MouseEvent) {
    const wrapper = this.$refs.tileWrapper as HTMLElement
    const wrapperRect = wrapper.getBoundingClientRect()
    this.mousePosition = this.getMovedByDelta({
      x: e.clientX,
      y: e.clientY,
    }, {
      x: -wrapperRect.x,
      y: -wrapperRect.y,
    })
  }

  getMouseMoveDelta(e: MouseEvent) {
    return {
      x: e.movementX,
      y: e.movementY
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
  border: 1px solid;
  /* display: flex;
  flex-flow: column nowrap; */
  background: white;
  border-radius: 5px;
  overflow: visible;
}

.header {
  display: flex;
  justify-content: flex-start;
  height: 14px;
  background: darkviolet;

  &:hover {
    cursor: grab;
  }

  * {
    max-height: 14px;
  }
}

.footer {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  height: 8px;
  background: darkviolet;

  .resize-widget {
    height: 100%;
    width: 15px;
    background-color: red;

    &:hover {
      cursor: grab;
    }
  }
}

.tile {
  height: 100%;
  overflow: auto;
}

.insulator {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 1;

  &.connectable:hover {
    cursor: pointer;
  }
}

.curve {
  position: absolute;
  top: 0;
  left: 0;
  /* z-index: -1; */
}
</style>
