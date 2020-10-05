<template>
  <div class="tile-box-wrapper">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class TilesBox extends Vue {
}
</script>

<style lang="scss">
.tile-box-wrapper {
  position: relative;
}
</style>
