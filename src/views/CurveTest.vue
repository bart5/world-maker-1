<template>
  <div class="wrapper">
    <svg width="240" height="160">
      <circle id="au" class="spot" cx="200" cy="50" r="4"></circle>
      <circle id="sl" class="spot" cx="100" cy="100" r="4"></circle>
      <circle id="cp" class="spot2" cx="0" cy="0" r="4"></circle>
      <path id="curve" d="M0 0" stroke="green" stroke-width="4" stroke-linecap="round" fill="transparent"></path>
    </svg>
    <svg :id="svgId">
      <path :id="curveId" stroke="red" stroke-width="4" stroke-linecap="round" fill="transparent"></path>
    </svg>
    <div class="p1" :style="styles.p1" @mousedown="startDrag('p1')"></div>
    <div class="p2" :style="styles.p2" @mousedown="startDrag('p2')"></div>
    <button type="button" @click="doStuff">Click</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
// import { Prop } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class CurveTest extends Vue {
  styles = {
    p1: {
      top: '600px',
      left: '400px',
    },
    p2: {
      top: '300px',
      left: '700px',
    }
  }

  dragInProgress = false

  pointDragged: 'p1' | 'p2' | null = null

  curveId = 'myCurve'

  svgId = 'mySvg'

  mounted() {
    this.drawCurve()
    this.drawBezierCurve()
    this.positionSvg()
  }

  startMousemoveListener(onMouseUp: (...args: []) => void) {
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseup', () => {
      onMouseUp()
      this.stopMousemoveListener()
    })
  }

  stopMousemoveListener() {
    window.removeEventListener('mousemove', this.onMouseMove)
  }

  startDrag(pointRef: 'p1' | 'p2') {
    this.pointDragged = pointRef

    this.dragInProgress = true
    this.startMousemoveListener(() => {
      this.dragInProgress = false
    })
  }

  onMouseMove(e: MouseEvent) {
    if (this.dragInProgress) {
      this.dragHandler(e)
    }
  }

  getMouseMoveDelta(e: MouseEvent) {
    return {
      x: e.movementX,
      y: e.movementY
    }
  }

  dragHandler(e: MouseEvent) {
    const delta = this.getMouseMoveDelta(e)
    if (this.pointDragged) {
      this.styles[this.pointDragged].top = Number(this.styles[this.pointDragged].top.replace('px', '')) + delta.y + 'px'
      this.styles[this.pointDragged].left = Number(this.styles[this.pointDragged].left.replace('px', '')) + delta.x + 'px'
      this.drawCurve()
      this.drawBezierCurve()
      this.positionSvg()
    }
  }

  get p1() {
    return {
      x: Number(this.styles.p1.left.replace('px', '')) + 8,
      y: Number(this.styles.p1.top.replace('px', '')) + 8
    }
  }

  get p2() {
    return {
      x: Number(this.styles.p2.left.replace('px', '')) + 8,
      y: Number(this.styles.p2.top.replace('px', '')) + 8
    }
  }

  get svgx() {
    return Math.min(this.p1.x, this.p2.x)
  }

  get svgy() {
    return Math.min(this.p1.y, this.p2.y)
  }

  positionSvg() {
    const svg = document.getElementById(this.svgId) as HTMLElement

    const width = Math.abs(this.p1.x - this.p2.x)
    const height = Math.abs(this.p1.y - this.p2.y)

    svg.setAttribute('width', width + 'px')
    svg.setAttribute('height', height + 'px')

    svg.style.left = this.svgx + 'px'
    svg.style.top = this.svgy + 'px'
  }

  drawCurve() {
    const curvePath = document.getElementById(this.curveId) as HTMLElement
    const p1x = Number(this.styles.p1.left.replace('px', ''))
    const p1y = Number(this.styles.p1.top.replace('px', ''))
    const p2x = Number(this.styles.p2.left.replace('px', ''))
    const p2y = Number(this.styles.p2.top.replace('px', ''))

    // mid-point of line:
    const mpx = (p2x + p1x) * 0.5;
    const mpy = (p2y + p1y) * 0.5;

    const offset = 100;

    // angle of perpendicular to line:
    const theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;

    const c1x = mpx + offset * Math.cos(theta);
    const c1y = mpy + offset * Math.sin(theta);

    // <path d="M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" stroke="black" fill="transparent"/>

    const curve = `M${p1x} ${p1y} Q${c1x} ${c1y} ${p2x} ${p2y}`;
    curvePath.setAttribute('d', curve)
  }

  drawBezierCurve() {
    /* This is for left to right data flow */
    const shiftx = this.svgx
    const shifty = this.svgy

    let localP1
    let localP2

    if (this.p1.x < this.p2.x) {
      localP1 = this.p1
      localP2 = this.p2
    } else {
      localP1 = this.p2
      localP2 = this.p1
    }

    const shapeCoef = 0.5

    const curvePath = document.getElementById(this.curveId) as HTMLElement
    var p1x = localP1.x - shiftx
    var p1y = localP1.y - shifty

    var p2x = localP2.x - shiftx
    var p2y = localP2.y - shifty

    var mpx = Math.max(p2x, p1x) * 0.5;
    var mpy = Math.max(p2y, p1y) * 0.5;

    var p1hx = shapeCoef * mpx
    var p1hy = p1y

    var p2hx = mpx + (1 - shapeCoef) * mpx
    var p2hy = p2y

    var mph1x = p1hx
    var mph1y = p1hy
    var mph2x = p2hx
    var mph2y = p2hy

    const curve = `M${p1x} ${p1y} C ${p1hx} ${p1hy} ${mph1x} ${mph1y} ${mpx} ${mpy} ${mph2x} ${mph2y} ${p2hx} ${p2hy} ${p2x} ${p2y}`;
    curvePath.setAttribute('d', curve)
  }

  doStuff() {
    var p1x = parseFloat(((document.getElementById('au') as HTMLElement).getAttribute('cx') as string));
    var p1y = parseFloat((document.getElementById('au') as HTMLElement).getAttribute('cy') as string);
    var p2x = parseFloat((document.getElementById('sl') as HTMLElement).getAttribute('cx') as string);
    var p2y = parseFloat((document.getElementById('sl') as HTMLElement).getAttribute('cy') as string);

    // mid-point of line:
    var mpx = (p2x + p1x) * 0.5;
    var mpy = (p2y + p1y) * 0.5;

    // angle of perpendicular to line:
    var theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;

    // distance of control point from mid-point of line:
    var offset = 30;

    // location of control point:
    var c1x = mpx + offset * Math.cos(theta);
    var c1y = mpy + offset * Math.sin(theta);

    // show where the control point is:
    var c1 = document.getElementById('cp') as HTMLElement;
    c1.setAttribute('cx', String(c1x));
    c1.setAttribute('cy', String(c1y));

    // construct the command to draw a quadratic curve
    var curve = 'M' + p1x + ' ' + p1y + ' Q ' + c1x + ' ' + c1y + ' ' + p2x + ' ' + p2y;
    var curveElement = document.getElementById('curve') as HTMLElement;
    curveElement.setAttribute('d', curve);
  }
}
</script>

<style lang="scss">
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

#mySvg {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
  // border: 1px solid;
}
</style>
