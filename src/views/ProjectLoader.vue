<template>
  <div>
    <h1 v-if="isLoadingStaticData">Loading static data...</h1>
    <template v-else-if="!Object.keys(staticData).length">
      <h1>No static data! :O </h1>
    </template>
    <template v-else>
      <h1>Static data loaded!</h1>
      <div>{{ staticData }}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { initializeDataManager } from '@/game/data/dataManager'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class ProjectLoader extends Vue {
  get isLoadingStaticData() {
    return this.$store.getters.loadingStaticData
  }

  get staticData() {
    return this.$store.getters.staticData
  }

  loadStaticData() {
    return this.$store.dispatch('loadStaticData')
  }

  mounted() {
    initializeDataManager(this)
    this.loadStaticData()
  }
}
</script>

<style lang="scss">
</style>
