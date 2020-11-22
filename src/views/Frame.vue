<template>
  <div class="frame-wrapper">
    <template v-if="projectDataIsLoaded">
      <WorkspaceSelector />
      <div class="main-view">
        <TypesWS v-if="is('types')" />
        <QuestsWS v-else-if="is('quests')" entityName="quest" />
        <DialogsWS v-else-if="is('dialogs')" />
      </div>

      <div v-if="isUnsavedData" class="status-bar">UNSAVED CHANGES</div>

      <Sidebar v-if="projectDataIsLoaded" class="sidebar" :class="{ 'show': showSidebar }"/>
    </template>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import WorkspaceSelector from '@/views/WorkspaceSelector.vue'
import TypesWS from '@/views/TypesWS.vue'
import QuestsWS from '@/views/QuestsWS.vue'
import DialogsWS from '@/views/DialogsWS.vue'
import Sidebar from '@/views/Sidebar.vue'

@Options({
  components: {
    WorkspaceSelector,
    TypesWS,
    QuestsWS,
    DialogsWS,
    Sidebar,
  },
})
export default class Frame extends Vue {
  showSidebar = false

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
          this.toggleSidebar()
          break;
        default:
          break;
      }
    }
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar
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
  position: relative;
  overflow: hidden;
}

.main-view {
  flex-grow: 1;
}

.sidebar {
  position: absolute;
  right: 0;
  transform: translateX(100%);
  top: 20px;
  transition: transform 0.2s;

  &.show {
    transform: translateX(0);
  }
}

</style>
