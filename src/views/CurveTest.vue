<template>
  <div class="wrapper">
    <svg width="240" height="160">
      <circle id="au" class="spot" cx="200" cy="50" r="4"></circle>
      <circle id="sl" class="spot" cx="100" cy="100" r="4"></circle>
      <circle id="cp" class="spot2" cx="0" cy="0" r="4"></circle>
      <path id="curve" d="M0 0" stroke="green" stroke-width="4" stroke-linecap="round" fill="transparent"></path>
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
    }
  }

  // makeSvg() {
  //   const svg = document.createElement('svg')
  //   svg.setAttribute()

  //   const curve = `M${p1x} ${p1y} Q${c1x} ${c1y} ${p2x} ${p2y}`;
  // }

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
  position: relative;

  &:hover {
    cursor: pointer;
  }
}
</style>
