<template>
  <div class="tile-wrapper">
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
export default class Tile extends Vue {
  @Prop() id!: string

  get self() {

  }

  startConnecting() {
    this.$store.dispatch('startConnecting', { id: this.id })
  }

  connect() {
    this.$store.dispatch('connect', { id: this.id })
  }

  get connectingInProgress() {

  }

  get tileDragInProgress() {

  }

  onMouseDown() {
    if (this.connectingInProgress) {
      this.connect()
    } else if (this.tileDragInProgress) {
      this.stopDrag()
    }
  }

  startDrag() {
    this.$store.dispatch('startTileDrag', { id: this.id })
  }

  stopDrag() {

  }

  get top() {
    this.self
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

}

.tile {
  height: 100%;
  overflow: scroll;
}
</style>
