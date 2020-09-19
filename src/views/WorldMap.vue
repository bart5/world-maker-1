<template>
  <div class="map-wrapper">
    <h1>Big ass map</h1>
    <div>
      <button @click="() => {incrementCanvasWidth(20); incrementCanvasHeigth(20)}">Increase size</button>
      <button @click="() => {incrementCanvasWidth(-20); incrementCanvasHeigth(-20)}">Decrease size</button>
    </div>
    <div class="frame">
      <canvas :width="canvasWidth" :height="canvasHeight" id="canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

@Options({
  components: {
    HelloWorld,
  },
})
export default class WorldMap extends Vue {
  canvasWidth = 1000

  canvasHeight = 1000

  drawCallId = 0

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
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

#canvas {
  border: 1px solid gray;
}

</style>
