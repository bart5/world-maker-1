<template>
  <div class="tile-wrapper">
    <div class="drag-bar"></div>
    <div class="tile">
      <component :is="TaskEditor"></component>
    </div>
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

  get isActive() {
    // return this.$store.getters.activeTile === this.id
    return true
  }

  // startDrag() {
  // }

  // onDrag() {

  // }

  // stopDrag() {

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

.drag-bar{
  height: 8px;
  background: darkviolet;
}

.tile {
  height: 100%;
  overflow: scroll;
}
</style>
