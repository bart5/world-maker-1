<template>
  <div class="tile-wrapper" :style="tileStyle">
    <div class="header"></div>
    <div class="tile">
      <component :is="TaskEditor"></component>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TaskEditor from '@/views/TaskEditor.vue'
import { Prop } from 'vue-property-decorator'

@Options({
  components: {
    TaskEditor
  },
})
export default class TileComponent extends Vue {
  @Prop() id!: string

  @Prop() isBox!: boolean

  resizeInProgress = false

  dragInProgress = false

  get self(): Tile {
    return this.$store.getters.activeWorkspaceTileById(this.id)
  }

  startConnecting() {
    this.$store.dispatch('startConnecting', { id: this.id })
  }

  connect() {
    this.$store.dispatch('connect', { id: this.id })
  }

  get connectingInProgress() {

  }

  startDrag() {
    this.dragInProgress = true
  }

  startResize() {
    this.resizeInProgress = true
  }

  onMouseMove(e: MouseEvent) {
    if (this.resizeInProgress) {
      this.resizeHandler(e)
    } else if (this.dragInProgress) {
      this.dragHandler(e)
    }
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
    this.$store.dispatch('moveTile', { tileId: this.id, delta: this.getMouseMoveDelta(e) })
  }

  stopDrag() {
    window.addEventListener('mousemove', this.onMouseMove)
  }

  get tileStyle() {
    const { width, height, x, y } = this.self

    return {
      width: width + 'px',
      height: height + 'px',
      left: x + 'px',
      right: y + 'px'
    }
  }

  // onFocus() {
  //   // set display hierarchy for case of overlap
  //   this.$store()
  // }
}
</script>

<style lang="scss">
.tile-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  height: 200px;
  width: 100px;
  border: 1px solid;
  display: flex;
  flex-flow: column nowrap;
}

.header{
  height: 8px;
  background: darkviolet;
}

.footer {
  height: 8px;
  background: darkviolet;
}

.tile {
  height: 100%;
  overflow: scroll;
}
</style>
