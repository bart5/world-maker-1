<template>
  <div class="frame-wrapper" @mousedown="stopConnectingTiles">
    <TabSelector />
    <div class="main-view">
      <BasicWS v-if="is('basic')" />
    </div>

    <div v-if="isUnsavedData" class="status-bar">UNSAVED CHANGES</div>

    <Sidebar v-if="projectDataIsLoaded"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Sidebar from '@/views/Sidebar.vue'
import BasicWS from '@/views/BasicWS.vue'

@Options({
  components: {
    Sidebar,
    BasicWS
  },
})
export default class Frame extends Vue {
  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  is(type: WorkspaceType) {
    return this.activeWorkspace.type === type
  }

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
