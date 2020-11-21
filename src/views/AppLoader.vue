<template>
  <div>
  </div>
</template>

<script lang="ts">
import { ipc } from '@/game/data/ipcHandlersRenderer'
import { transactionHandler } from '@/store/transactions'
import { Options, Vue } from 'vue-class-component'

@Options({})
export default class AppLoader extends Vue {
  get applicationData(): ApplicationData {
    return this.$store.getters.applicationData
  }

  keyboardHandler(e: KeyboardEvent) {
    if (e.ctrlKey) {
      switch (e.key) {
        case 'z':
          console.log('z')
          transactionHandler.revertTo()
          break
        case 'y':
          transactionHandler.unRevertTo()
          break
        default:
          break;
      }
    } else {
      switch (e.key) {
        case 'Escape':
          this.closeWidgets(e)
          break
        default:
          break;
      }
    }
  }

  closeWidgets(e: any | MouseEvent | KeyboardEvent) {
    if (e.key && e.key !== 'Escape') return
    this.$store.dispatch('setWidgetKey', {})
  }

  addGlobalListeners() {
    window.addEventListener('click', this.closeWidgets)
    window.addEventListener('keydown', this.keyboardHandler)
  }

  async mounted() {
    ipc.initListeners(this)
    transactionHandler.init(this)
    await this.$store.dispatch('asyncLoadApplicationData')

    this.addGlobalListeners()

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
