<template>
  <ModalWrapper>
    <h4>Types Manager</h4>
    <hr>
    <button
      class="type"
      v-for="typeName in projectTypesNames"
      :key="typeName"
      @click="selectType(typeName)"
    >
      {{ typeName }}
    </button>
    <hr>
    <h3 v-if="selectedType">Selected type: {{ selectedType.name }}</h3>
    <ObjectDisplay
      v-if="!!selectedType"
      :typeName="selectedTypeName"
      :entityType="'type'"
      :editable="true"
    />
      <!-- :instanceId="instanceId" -->
    <hr>
    <div>Placeholder for instance (JSON and visual presentation)</div>
    <hr>
    <h3>Raw selected type:</h3>
    {{ selectedType }}
    <hr>
    <h3>Raw types from project data:</h3>
    {{ projectTypes }}
  </ModalWrapper>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import ModalWrapper from '@/views/ModalWrapper.vue'
import ObjectDisplay from '@/views/ObjectDisplay.vue'

@Options({
  components: {
    ModalWrapper,
    ObjectDisplay
  },
})
export default class TypesManager extends Vue {
  selectedTypeName = ''

  get projectTypes() {
    return this.$store.getters.projectTypes
  }

  get selectedType() {
    return this.projectTypes[this.selectedTypeName] || null
  }

  get projectTypesNames() {
    return Object.keys(this.projectTypes)
  }

  selectType(typeName: string) {
    console.log('selecting type: ', typeName)
    this.selectedTypeName = typeName
  }
}
</script>

<style lang="scss" scoped>

.type {
  width: 100%;
  height: 24px;
  text-align: center;
  border: 1px solid;
  margin-bottom: 10px;
}

</style>
