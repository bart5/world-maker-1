<template>
  <div class="wrapper" v-if="projectDataIsLoaded">
    <div class="tab-selector">
      <div class="tab-switch" @click="toInstances">Instances</div>
      <div class="tab-switch" @click="toTypes">Types</div>
      <div class="tab-switch" @click="toChanges">Changes</div>
    </div>
    <hr>
    <div class="tab">
      <template v-if="showInstances || showTypes">
        <Collapsible title="All">
          <Filters
            :mode="showInstances ? 'instances' : 'types'"
            @update-instances="updateFilteredInstances"
            @update-types="updateFilteredTypes"
          />
          <TypeViewUniversal
            :onlyValues="showInstances"
            :onlyTypes="showTypes"
            :types="filteredTypes"
            :instances="filteredInstances"
            :alwaysMeta="showMeta"
          />
        </Collapsible>
        <Collapsible title="Selected">
          <Filters
            :mode="showInstances ? 'instances' : 'types'"
            @update-instances="updateFilteredSelectedInstances"
            @update-types="updateFilteredSelectedTypes"
          />
          <TypeViewUniversal
            :onlyValues="showInstances"
            :onlyTypes="showTypes"
            :types="filteredSelectedTypes"
            :instances="filteredSelectedInstances"
            :alwaysMeta="showMeta"
          />
        </Collapsible>
      </template>
      <Changes v-else class="changes" />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TypeViewUniversal from '@/views/TypeViewUniversal.vue'
import Changes from '@/views/Changes.vue'
import Collapsible from '@/views/Collapsible.vue'

@Options({
  components: {
    TypeViewUniversal,
    Changes,
    Collapsible
  },
})
export default class Sidebar extends Vue {
  filteredInstances: Instance[] = []
  filteredTypes: TypeWrapper[] = []
  filteredSelectedInstances: Instance[] = []
  filteredSelectedTypes: TypeWrapper[] = []

  get selectedInstances(): Instances[] {
    return this.$store.getters.selectedInstances()
  }

  get selectedTypes(): TypeWrapper[] {
    return this.$store.getters.selectedTypes()
  }

  updateFilteredInstances({ instances }: { instances: Instance[] }) {
    this.filteredInstances = instances
  }

  updateFilteredSelectedInstances({ instances }: { instances: Instance[] }) {
    this.filteredSelectedInstances = instances
  }

  updateFilteredTypes({ types }: { types: TypeWrapper[] }) {
    this.filteredTypes = types
  }

  updateFilteredSelectedTypes({ types }: { types: TypeWrapper[] }) {
    this.filteredSelectedTypes = types
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
  max-height: 100%;
  overflow-y: scroll;
  width: 880px;
  background: lightgray;
  padding: 12px;
}

.tab-selector {
  display: flex;
  width: 100%;
}

</style>
