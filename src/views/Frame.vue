<template>
  <div class="frame-wrapper" @mousedown="stopConnectingTiles">
    <TabSelector />

    <div v-if="isUnsavedData" class="status-bar">UNSAVED CHANGES</div>

    <Sidebar v-if="projectDataIsLoaded"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Sidebar from '@/views/Sidebar.vue'

@Options({
  components: {
    Sidebar
  },
})
export default class Frame extends Vue {
  get isUnsavedData() {
    return this.$store.getters.isUnsavedData
  }

  get projectDataIsLoaded() {
    return this.$store.getters.projectDataIsLoaded
  }

  keyboardHandler(e: KeyboardEvent) {
    if (!this.projectDataIsLoaded) return

    if (e.ctrlKey) {
      switch (e.key) {
        case 's':
          this.$store.dispatch('asyncSaveProject', true)
          break;
        case 't':
          this.$store.dispatch('openModal', 'Sidebar')
          break;
        default:
          break;
      }
    }
  }

  mounted() {
    window.addEventListener('keydown', this.keyboardHandler)
  }
}
</script>

<style lang="scss" scoped>
.frame-wrapper {
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-flow: column nowrap;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
