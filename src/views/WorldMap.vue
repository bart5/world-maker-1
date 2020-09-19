<template>
  <div class="map-wrapper">
    <h1>Big ass map</h1>
    <div>
      <button @click="() => {incrementCanvasWidth(20); incrementCanvasHeigth(20)}">Increase size</button>
      <button @click="() => {incrementCanvasWidth(-20); incrementCanvasHeigth(-20)}">Decrease size</button>
      <Toggle label="Grab map"/>
      <Toggle label="Draw"/>
    </div>
    <div
      class="frame"
      ref="mapFrame"
    >
      <canvas :width="canvasWidth" :height="canvasHeight" id="canvas"
        :class="{ grabMap, dragMap }"
        ref="mapCanvas"
        @mousedown="handleCanvasMousedown"
        @mouseup="handleCanvasMouseup"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import Toggle from '@/components/Toggle.vue';

@Options({
  components: {
    Toggle,
  },
})
export default class WorldMap extends Vue {
  canvasWidth = 1000

  canvasHeight = 1000

  drawCallId = 0

  grabMap = false

  dragMap = false

  @Watch('canvasWidth')
  @Watch('canvasHeight')
  renderCanvas() {
    const id = window.setTimeout(() => {
      if (id === this.drawCallId) {
        this.drawMap()
      }
    }, 300)

    if (id !== this.drawCallId) {
      window.clearTimeout(this.drawCallId)
    }

    this.drawCallId = id
  }

  mounted() {
    this.drawMap()
    console.log(this)
  }

  drawMap() {
    console.log('drawing')
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        console.warn('Could not obtain rendering context')
        return
      }

      console.log('about to draw')
      ctx.fillStyle = 'green'
      ctx.fillRect(500, 500, 150, 100)
    }
  }

  setCanvasWidth(x: number) {
    this.canvasWidth = x
  }

  setCanvasHeight(y: number) {
    this.canvasHeight = y
  }

  incrementCanvasWidth(dx: number) {
    this.setCanvasWidth(this.canvasWidth + dx)
  }

  incrementCanvasHeigth(dy: number) {
    this.setCanvasHeight(this.canvasHeight + dy)
  }

  startDrag() {
    this.dragMap = true
    window.addEventListener('mousemove', this.onMovement)
    window.addEventListener('mouseup', this.endDrag)
  }

  endDrag() {
    this.dragMap = false
    window.removeEventListener('mousemove', this.onMovement)
    window.removeEventListener('mouseup', this.endDrag)
  }

  onMovement(event: MouseEvent) {
    const dx = event.movementX
    const dy = event.movementY
    this.mapFrame.scrollBy(-dx, -dy)
  }

  handleCanvasMousedown(e: MouseEvent) {
    console.log('mousedown event: ', e)
    if (this.grabMap) {
      this.startDrag()
    }
  }

  handleCanvasMouseup(e: MouseEvent) {
    console.log('mouseup event: ', e)
  }

  get mapCanvas() {
    return this.$refs.mapCanvas as HTMLCanvasElement
  }

  get mapFrame() {
    return this.$refs.mapFrame as HTMLDivElement
  }
}
</script>

<style lang="scss">
.map-wrapper {
  display: flex;
  flex-flow: column;
  overflow: hidden;
}

.frame {
  border: 2px solid;
  width: 100%;
  display: flex;
  align-items: baseline;
  overflow: scroll;
}

#canvas {
  border: 1px solid gray;

  &.grabMap:hover {
    cursor: grab;
  }

  &.dragMap:hover {
    cursor: grabbing;
  }
}

</style>
