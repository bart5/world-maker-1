<template>
  <div class="wrapper">
    <svg ref="svg">
      <path ref="path" stroke="red" stroke-width="2" stroke-linecap="round" fill="transparent"></path>
    </svg>
    <!-- <div class="p1" :style="styles.p1" @mousedown="startDrag('p1')"></div>
    <div class="p2" :style="styles.p2" @mousedown="startDrag('p2')"></div> -->
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class Curve extends Vue {
  @Prop() p1!: {
    x: number,
    y: number
  }

  @Prop() p2!: {
    x: number,
    y: number
  }

  @Watch('p2')
  dragHandler() {
    // dragHandler(e: MouseEvent) {
    // const delta = this.getMouseMoveDelta(e)
    // if (this.pointDragged) {
    // this.styles[this.pointDragged].top = Number(this.styles[this.pointDragged].top.replace('px', '')) + delta.y + 'px'
    // this.styles[this.pointDragged].left = Number(this.styles[this.pointDragged].left.replace('px', '')) + delta.x + 'px'
    // }
    if (this.p1p2x > this.p1p2y) {
      this.horizontalCurve = true
    } else {
      this.horizontalCurve = false
    }
    this.drawBezierCurve(this.horizontalCurve)
    this.positionSvg()
  }

  styles = {
    p1: {
      top: this.p1.x + 'px',
      left: this.p1.y + 'px',
    },
    p2: {
      top: this.p2.x + 'px',
      left: this.p2.y + 'px',
    }
  }

  dragInProgress = false

  pointDragged: 'p1' | 'p2' | null = null

  // curveId = 'myCurve'

  // svgId = 'mySvg'

  horizontalCurve = false

  mounted() {
    this.dragInProgress = true
    this.drawBezierCurve(this.horizontalCurve)
    this.positionSvg()
  }

  // startMousemoveListener(onMouseUp: (...args: []) => void) {
  //   window.addEventListener('mousemove', this.onMouseMove)
  //   window.addEventListener('mouseup', () => {
  //     onMouseUp()
  //     this.stopMousemoveListener()
  //   })
  // }

  // stopMousemoveListener() {
  //   window.removeEventListener('mousemove', this.onMouseMove)
  // }

  // startDrag(pointRef: 'p1' | 'p2') {
  //   this.pointDragged = pointRef

  //   this.dragInProgress = true
  //   this.startMousemoveListener(() => {
  //     this.dragInProgress = false
  //   })
  // }

  // onMouseMove(e: MouseEvent) {
  //   if (this.dragInProgress) {
  //     this.dragHandler(e)
  //   }
  // }

  getMouseMoveDelta(e: MouseEvent) {
    return {
      x: e.movementX,
      y: e.movementY
    }
  }

  // get p1() {
  //   return {
  //     x: Number(this.styles.p1.left.replace('px', '')) + 8,
  //     y: Number(this.styles.p1.top.replace('px', '')) + 8
  //   }
  // }

  // get p2() {
  //   return {
  //     x: Number(this.styles.p2.left.replace('px', '')) + 8,
  //     y: Number(this.styles.p2.top.replace('px', '')) + 8
  //   }
  // }

  get p1p2x() {
    return Math.abs(this.p1.x - this.p2.x)
  }

  get p1p2y() {
    return Math.abs(this.p1.y - this.p2.y)
  }

  get svgx() {
    return Math.min(this.p1.x, this.p2.x)
  }

  get svgy() {
    return Math.min(this.p1.y, this.p2.y)
  }

  positionSvg() {
    // const svg = document.getElementById(this.svgId) as HTMLElement
    const svg = this.$refs.svg as HTMLElement

    const width = Math.abs(this.p1.x - this.p2.x)
    const height = Math.abs(this.p1.y - this.p2.y)

    svg.setAttribute('width', width + 'px')
    svg.setAttribute('height', height + 'px')

    svg.style.left = this.svgx + 'px'
    svg.style.top = this.svgy + 'px'
  }

  drawBezierCurve(horizontal: boolean) {
    /* This is for left to right data flow */
    const shiftx = this.svgx
    const shifty = this.svgy

    let localP1
    let localP2

    if (horizontal) {
      if (this.p1.x < this.p2.x) {
        localP1 = this.p1
        localP2 = this.p2
      } else {
        localP1 = this.p2
        localP2 = this.p1
      }
    } else if (!horizontal) {
      if (this.p1.y < this.p2.y) {
        localP1 = this.p2
        localP2 = this.p1
      } else {
        localP1 = this.p1
        localP2 = this.p2
      }
    }

    if (!localP1 || !localP2) return

    const shapeCoef = 0.5

    // const curvePath = document.getElementById(this.curveId) as HTMLElement
    const curvePath = this.$refs.path as HTMLElement

    var p1x = localP1.x - shiftx
    var p1y = localP1.y - shifty

    var p2x = localP2.x - shiftx
    var p2y = localP2.y - shifty

    var mpx = Math.max(p2x, p1x) * 0.5;
    var mpy = Math.max(p2y, p1y) * 0.5;

    var p1hx = horizontal ? shapeCoef * mpx : p1x
    var p1hy = horizontal ? p1y : mpy + shapeCoef * mpy

    var p2hx = horizontal ? mpx + shapeCoef * mpx : p2x
    var p2hy = horizontal ? p2y : shapeCoef * mpy

    var mph1x = p1hx
    var mph1y = p1hy
    var mph2x = p2hx
    var mph2y = p2hy

    const curve = `M${p1x} ${p1y} C ${p1hx} ${p1hy} ${mph1x} ${mph1y} ${mpx} ${mpy} ${mph2x} ${mph2y} ${p2hx} ${p2hy} ${p2x} ${p2y}`;
    curvePath.setAttribute('d', curve)
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.p1, .p2 {
  position: absolute;
  border: 2px solid;
  background: red;
  width: 16px;
  height: 16px;
  border-radius: 50%;

  &:hover {
    cursor: pointer;
  }
}

svg {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
}
</style>
