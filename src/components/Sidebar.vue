<template>
  <div class="sidebar-wrapper">
    <div class="tab-selector">
      <!-- <div class="tab-switch" :class="{ 'active': showInstances }" @click="show('instances')">Instances</div> -->
      <div class="tab-switch"  @click="show('instances')">
        <button class="toggle fill" :class="{ 'active': showInstances }">Instances</button>
      </div>
      <div class="tab-switch" @click="show('types')">
        <button class="toggle fill" :class="{ 'active': showTypes }">Types</button>
      </div>
      <div class="tab-switch" @click="show('changes')">
        <button class="toggle fill" :class="{ 'active': showChanges }">Changes</button>
      </div>
    </div>
    <hr>
    <div class="tab">
      <!-- Top half of the sidebar -->
      <Collapsible
        v-show="showInstances || showTypes"
        title="All" class="content-section"
      >
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
      <!-- Bottom half of the sidebar -->
      <Collapsible
        v-show="showInstances || showTypes"
        title="Selected" class="content-section"
      >
        <Filters
          :mode="showInstances ? 'instances' : 'types'"
          :instances="selectedInstances"
          :types="selectedTypes"
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
      <!-- Changes (take entire sidebar alone) -->
      <Changes v-if="showChanges" class="changes" />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TypeViewUniversal from '@/components/TypeViewUniversal.vue'
import Changes from '@/components/Changes.vue'
import Collapsible from '@/components/Collapsible.vue'
import Filters from '@/components/Filters.vue'

type TabType = 'instances' | 'types' | 'changes'

@Options({
  components: {
    TypeViewUniversal,
    Changes,
    Collapsible,
    Filters,
  },
})
export default class Sidebar extends Vue {
  showMeta = false

  showInstances = true
  showTypes = false
  showChanges = false

  show(tab: TabType) {
    this.showInstances = tab === 'instances' || false
    this.showTypes = tab === 'types' || false
    this.showChanges = tab === 'changes' || false
  }

  filteredInstances: Instance[] = []
  filteredTypes: TypeWrapper[] = []
  filteredSelectedInstances: Instance[] = []
  filteredSelectedTypes: TypeWrapper[] = []

  get randomType() {
    return (this.$store.getters.types as TypeWrapper[])[1]
  }

  get selectedInstances(): Instances[] {
    // return this.$store.getters.selectedInstances()
    return []
  }

  get selectedTypes(): TypeWrapper[] {
    // return this.$store.getters.selectedTypes()
    return []
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

.sidebar-wrapper {
  height: 100%;
  overflow-y: scroll;
  min-width: 560px;
  max-width: 560px;
  background: lightgray;
  padding: 12px;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
}

.tab-selector {
  display: flex;
  width: 100%;
  justify-content: space-evenly;

  .tab-switch {
    border: 1px solid;
    border-bottom: none;
    flex-grow: 1;

    &:hover {
      cursor: pointer;
    }
  }
}

.tab {
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  overflow: hidden;

  .content-section {
    overflow-y: scroll;
    border: 1px solid;
  }
}

</style>
