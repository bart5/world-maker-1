<template>
  <div>
  </div>
</template>

<script lang="ts">
import { ipc } from '@/game/data/ipcHandlersRenderer'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class AppLoader extends Vue {
  loadingApplicationData = true

  get applicationData(): ApplicationData {
    return this.$store.getters.applicationData
  }

  async mounted() {
    ipc.initListeners(this)
    await this.$store.dispatch('asyncLoadApplicationData')
    this.loadingApplicationData = false

    if (this.applicationData.lastProjectId) {
      this.$store.dispatch('asyncOpenKnownProjectFromId', this.applicationData.lastProjectId)
    } else {
      this.$store.dispatch('openModal', 'projectSelector')
    }
  }
}
</script>

<style lang="scss">
</style>
