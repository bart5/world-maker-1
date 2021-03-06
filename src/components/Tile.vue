<template>
  <div
    ref="tileWrapper"
    class="tile-wrapper"
    :class="{'valid-connection': indicateValidConnection, 'invalid-connection': indicateInvalidConnection}"
    :style="tileWrapperStyle"
    @mousedown="bringTileForward"
  >
    <div v-if="connectingInProgress" class="overlay connect-overlay" @mousedown="tryConnect"></div>
    <div v-if="tileDeletionInProgress" class="overlay delete-overlay" @click="tryDelete">
      <div class="text">Delete</div>
    </div>
    <div class="header-wrapper">
      <div class="header" :style="headerStyle" @mousedown="startDrag">
        <!-- <button class="connect-button" @click="startConnecting">
          <img src="../assets/connector.svg" alt="">
        </button> -->
        <div class="tile-title">Title</div>
      </div>
    </div>
    <div class="tile" ref="tile">
      <template v-if="type === 'type'">
        <TypeView :tId="id" />
      </template>
      <template v-else>
        <div>
          Other content
        </div>
      </template>
    </div>
    <div class="footer" :style="footerStyle">
      <div v-if="!adaptive" class="resize-widget" @mousedown="startResize"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import TypeView from '@/components/TypeView.vue'

@Options({
  components: {
    TypeView
  },
})
export default class TileComponent extends Vue {
  @Prop() tile!: Tile

  @Prop() scale!: number

  @Prop() modulus!: number

  @Prop() boardId!: string

  @Prop({ default: true }) adaptive!: boolean

  @Prop() relativeMousePosition!: {
    x: number,
    y: number,
  }

  resizeInProgress = false

  dragInProgress = false

  dataSection = 'dataSection'

  filtersSection = 'filtersSection'

  sourcesSection = 'sourcesSection'

  sectionToShow = this.dataSection

  /* It allows to avoid jumpy movement when grabbing tile */
  grabPosition = {
    x: 0,
    y: 0
  }

  headerHeight = 20

  footerHeight = 10

  get type() { return this.tile.type }

  get id() { return this.tile.id }

  get indicateValidConnection() {
    return this.connectingInProgress && this.isValidConnectionCandidate
  }

  get indicateInvalidConnection() {
    return this.connectingInProgress && !this.isValidConnectionCandidate
  }

  get isValidConnectionCandidate() {
    return !this.hasConnectedInput && !this.isConnectedWithSelectedInputSource && !this.isSelectedInputSource
  }

  get isConnectedWithSelectedInputSource() {
    return this.selectedInputSourceTile.inputSource === this.tile.id
  }

  get hasConnectedInput() {
    return this.tile.inputSource !== ''
  }

  get selectedInputSourceTile(): Tile {
    return this.$store.getters.selectedInputSourceTile
  }

  get isSelectedInputSource() {
    return this.selectedInputSourceTile.id === this.tile.id
  }

  get connectingInProgress() {
    return this.$store.getters.connectingInProgress
  }

  get tileDeletionInProgress() {
    return this.$store.getters.tileDeletionInProgress
  }

  get tileWrapperElement() {
    return this.$refs.tileWrapper as HTMLElement
  }

  get tileElement() {
    return this.$refs.tile as HTMLElement
  }

  startConnecting(e: MouseEvent) {
    if (this.connectingInProgress) return
    this.$store.dispatch('startConnectingTiles', this.tile.id)
    this.startMousemoveListener()
    this.$emit('connecting', e)
  }

  tryConnect(e: MouseEvent) {
    if (this.isValidConnectionCandidate) {
      this.$store.dispatch('connectToThisTile', this.tile.id)
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
    this.$store.dispatch('deleteTile', this.tile.id)
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

  startDrag(e: MouseEvent) {
    if (this.connectingInProgress) return
    this.dragInProgress = true
    this.updateGrabRelativePosition(e)
    this.$emit('start-drag')
    this.startMousemoveListener(() => {
      this.dragInProgress = false
      this.$emit('stop-drag')
    })
  }

  updateGrabRelativePosition(e: MouseEvent) {
    const tileWrapperRect = this.tileWrapperElement.getBoundingClientRect()
    const shiftX = (e.clientX - tileWrapperRect.x) * (1 / this.scale)
    const shiftY = (e.clientY - tileWrapperRect.y) * (1 / this.scale)
    this.grabPosition = {
      x: shiftX,
      y: shiftY
    }
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
    const newPositionX = this.relativeMousePosition.x
    const newPositionY = this.relativeMousePosition.y
    const newPosition = {
      x: newPositionX - (newPositionX % this.modulus),
      y: newPositionY - (newPositionY % this.modulus)
    }
    this.$store.dispatch('resizeTile', { tileId: this.tile.id, newPosition })
  }

  dragHandler() {
    const newPositionX = this.relativeMousePosition.x - this.grabPosition.x
    const newPositionY = this.relativeMousePosition.y - this.grabPosition.y
    const newPosition = {
      x: newPositionX - (newPositionX % this.modulus),
      y: newPositionY - (newPositionY % this.modulus)
    }
    this.$store.dispatch('dragTile', { tileId: this.tile.id, newPosition })
  }

  get tileWrapperStyle() {
    const { width, height, x, y, zIndex } = this.tile

    return {
      width: this.adaptive ? 'auto' : width + 'px',
      height: this.adaptive ? 'auto' : height + 'px',
      left: x + 'px',
      top: y + 'px',
      zIndex,
    }
  }

  get headerStyle() {
    return {
      minHeight: this.headerHeight + 'px',
      maxHeight: this.headerHeight + 'px',
    }
  }

  get footerStyle() {
    return {
      minHeight: this.footerHeight + 'px',
      maxHeight: this.footerHeight + 'px',
    }
  }

  bringTileForward(e: MouseEvent) {
    this.$store.dispatch('bringTileForward', this.tile.id)
    e.stopPropagation()
  }

  get tileWidth() {
    return this.tileWrapperElement.offsetWidth
  }

  get tileHeight() {
    return this.tileWrapperElement.offsetHeight
  }

  mounted() {
    if (this.adaptive) {
      this.$watch('tileWidth', (width: number) => {
        this.$store.dispatch('setTileWidth', { boardId: this.boardId, tileId: this.id, width })
      }, { immediate: true })
      this.$watch('tileHeight', (height: number) => {
        this.$store.dispatch('setTileHeight', { boardId: this.boardId, tileId: this.id, height })
      }, { immediate: true })
    }
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
  display: flex;
}
</style>
