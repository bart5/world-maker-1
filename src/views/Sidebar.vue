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
            class="filters"
            @update-instances="updateFilteredInstance"
            @update-types="updateFilteredTypes"
          />
          <TypeView
            class="type-view"
            v-if="selectedType"
            :tId="selectedTId"
            :alwaysMeta="showMeta"
          />
        </Collapsible>
        <Collapsible title="Selected">
          <Filters
            class="filters"
            @update-instances="updateFilteredInstance"
          />
          <TypeView
            class="type-view"
            v-if="selectedType"
            :tId="selectedTId"
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
import TypeView from '@/views/TypeView.vue'
import Changes from '@/views/Changes.vue'
import Collapsible from '@/views/Collapsible.vue'
import { act } from '@/store/transactions'

@Options({
  components: {
    TypeView,
    Changes,
    Collapsible
  },
})
export default class Sidebar extends Vue {
  selectedTId = ''
  selectedIId = ''
  selectedITId = ''

  get types() {
    return this.$store.getters.types as TypeWrapper[]
  }

  get selectedType() {
    return this.$store.getters.getType({ tId: this.selectedTId })
  }

  get selectedTypeInstances() {
    if (!this.selectedTId) return []
    console.log('getting instances for type id: ', this.selectedTId)
    return this.$store.getters.getFilteredInstances({ tId: this.selectedTId })
  }

  get allInstances() {
    return this.$store.getters.getFilteredInstances({})
  }

  get selectedInstance() {
    return Boolean(this.$store.getters.getInstance({ iId: this.selectedIId }))
  }

  get projectDataIsLoaded() {
    return this.$store.getters.projectDataIsLoaded
  }

  selectType(tId: string) {
    this.selectedTId = tId
  }

  selectInstance(iId: string) {
    this.selectedIId = iId
    this.selectedITId = this.$store.getters.getTypeId({ iId })
  }

  createNewType() {
    act('createType', {})
  }

  renameType(tId: string, newName: string) {
    act('renameType', { tId, newName })
  }

  removeType(tId: string) {
    act('removeType', { tId })
  }

  removeInstance(iId: string) {
    act('removeInstance', { iId })
  }

  get recentChanges() {
    return this.$store.getters.recentChanges
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

  &::-webkit-scrollbar {
    display: block;
    width: 10px;
    background: gray;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.4);
  }
}

.type, .instance {
  width: 100%;
  height: 24px;
  text-align: center;
  border: 1px solid;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.tab-selector {
  display: flex;
  width: 100%;
}

</style>
