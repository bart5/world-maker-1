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

  async mounted() {
    ipc.initListeners(this)
    transactionHandler.init(this)
    await this.$store.dispatch('asyncLoadApplicationData')

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
