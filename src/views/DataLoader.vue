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
export default class DataLoader extends Vue {
  loadingApplicationData = true

  mounted() {
    ipc.initListeners(this)
    this.$store.dispatch('asyncLoadApplicationData').then(() => {
      this.loadingApplicationData = false
    })
  }
}
</script>

<style lang="scss">
</style>
