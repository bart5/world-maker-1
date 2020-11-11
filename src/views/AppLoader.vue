<template>
  <div>
  </div>
</template>

<script lang="ts">
import { ipc } from '@/game/data/ipcHandlersRenderer'
import { transactionHandler } from '@/store/transactions'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class AppLoader extends Vue {
  get applicationData(): ApplicationData {
    return this.$store.getters.applicationData
  }

  closeWidgets(e: any | MouseEvent | KeyboardEvent) {
    if (e.key && e.key !== 'Escape') return
    this.$store.dispatch('setWidgetKey', {})
  }

  async mounted() {
    ipc.initListeners(this)
    transactionHandler.init(this)
    await this.$store.dispatch('asyncLoadApplicationData')

    window.addEventListener('click', this.closeWidgets)
    window.addEventListener('keydown', this.closeWidgets)

    if (this.applicationData.lastProjectPath) {
      this.$store.dispatch('asyncOpenProjectFromPath', this.applicationData.lastProjectPath)
    } else {
      this.$store.dispatch('openModal', 'projectSelector')
    }
  }
}
</script>

<style lang="scss">
</style>
