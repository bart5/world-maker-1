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
          <template v-if="showInstances">
            <TypeView
              v-for="instance in filteredInstances"
              :tId="instance.meta_typeId[0]"
              :iId="instance.id[0]"
              :key="instance.id[0]"
              :alwaysMeta="showMeta"
            />
          </template>
          <template v-if="showTypes">
            <TypeView
              v-for="typeWrapper in filteredTypes"
              :tId="typeWrapper.id"
              :key="typeWrapper.id"
              :alwaysMeta="showMeta"
            />
          </template>
        </Collapsible>
        <Collapsible title="Selected">
          <Filters
            :mode="showInstances ? 'instances' : 'types'"
            @update-instances="updateFilteredSelectedInstances"
            @update-types="updateFilteredSelectedTypes"
          />
          <template v-if="showInstances">
            <TypeView
              v-for="instance in filteredSelectedInstances"
              :tId="instance.meta_typeId[0]"
              :iId="instance.id[0]"
              :key="instance.id[0]"
              :alwaysMeta="showMeta"
            />
          </template>
          <template v-if="showTypes">
            <TypeView
              v-for="typeWrapper in filteredSelectedTypes"
              :tId="typeWrapper.id"
              :key="typeWrapper.id"
              :alwaysMeta="showMeta"
            />
          </template>
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

@Options({
  components: {
    TypeView,
    Changes,
    Collapsible
  },
})
export default class Sidebar extends Vue {

  filteredInstance: Instance[] = []
  filteredTypes: TypeWrapper[] = []
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
