<template>
  <div class="map-wrapper">
    <h1>Big ass map</h1>
    <div>
      <button @click="() => {incrementCanvasWidth(20); incrementCanvasHeigth(20)}">Increase size</button>
      <button @click="() => {incrementCanvasWidth(-20); incrementCanvasHeigth(-20)}">Decrease size</button>
      <Toggle label="Grab map"
        :value="grabMap"
        @checked="(newValue) => grabMap = newValue"
      />
      <Toggle label="Draw"
        :value="drawOnMap"
        @checked="(newValue) => drawOnMap = newValue"
      />
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

  drawOnMap = false

  lastDrawPosition = {
    x: 0,
    y: 0
  }

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
    this.ctx.fillStyle = 'green'
    this.ctx.fillRect(500, 500, 150, 100)
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
    window.addEventListener('mousemove', this.onDrag)
    window.addEventListener('mouseup', this.endDrag)
  }

  endDrag() {
    this.dragMap = false
    window.removeEventListener('mousemove', this.onDrag)
    window.removeEventListener('mouseup', this.endDrag)
  }

  onDrag(e: MouseEvent) {
    const dx = e.movementX
    const dy = e.movementY
    this.mapFrame.scrollBy(-dx, -dy)
  }

  startDraw(e: MouseEvent) {
    this.lastDrawPosition = {
      x: e.offsetX,
      y: e.offsetY
    }
    window.addEventListener('mousemove', this.onDraw)
    window.addEventListener('mouseup', this.endDraw)
  }

  endDraw() {
    window.removeEventListener('mousemove', this.onDraw)
    window.removeEventListener('mouseup', this.endDraw)
  }

  onDraw(e: MouseEvent) {
    const x1 = this.lastDrawPosition.x
    const y1 = this.lastDrawPosition.y
    const x2 = e.offsetX
    const y2 = e.offsetY

    this.ctx.beginPath();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();

    this.lastDrawPosition = {
      x: x2,
      y: y2
    }
  }

  handleCanvasMousedown(e: MouseEvent) {
    console.log('mousedown event: ', e)
    if (this.grabMap) {
      this.startDrag()
    } else if (this.drawOnMap) {
      this.startDraw(e)
    }
  }

  handleCanvasMouseup(e: MouseEvent) {
    console.log('mouseup event: ', e)
  }

  get mapCanvas(): HTMLCanvasElement {
    const canvas = this.$refs.mapCanvas as HTMLCanvasElement
    if (canvas && canvas.getContext) {
      return canvas
    }
    throw Error('Could not locate canvas.')
  }

  get ctx() {
    const ctx = this.mapCanvas.getContext('2d')
    if (ctx) {
      return ctx
    }
    throw Error('Could not get 2D context')
  }

  get mapFrame() {
    return this.$refs.mapFrame as HTMLDivElement
  }

  getCanvasCoords(x: number, y: number) {
    const rect = this.mapCanvas.getBoundingClientRect()
    console.log('x: ', x)
    console.log('rect left: ', rect.left)
    console.log('y: ', y)
    console.log('rect top: ', rect.top)
    return {
      x: x - rect.left,
      y: y - rect.top
    }
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
