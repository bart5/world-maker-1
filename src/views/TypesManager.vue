<template>
  <ModalWrapper>
    <h4>Types Manager</h4>
    <hr>
    <div
      class="type"
      v-for="type in projectTypes"
      :key="type.name"
      @click="selectType(type)"
    >
      {{ type.name }}
    </div>
    <hr>
    <h3 v-if="selectedType">Selected type: {{ selectedType.name }}</h3>
    <ObjectDisplay
      v-if="!!selectedType"
      :entities="selectType.instance"
      :entityType="'type'"
      :typeName="selectType.name"
      :isTopObject="true"
      :editable="editable"
      :containerType="struct"
    />
    <hr>
    <div>Placeholder for instance (JSON and visual presentation)</div>
    <hr>
    <h3>Raw selected type:</h3>
    {{ this.selectedType }}
    <hr>
    <h3>Raw types from project data:</h3>
    {{ this.projectTypes }}
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
  selectedType: TypeDescriptor | null = null

  get projectTypes() {
    return this.$store.getters.projectTypes
  }

  selectType(type: TypeDescriptor) {
    this.selectedType = type
  }
}
</script>

<style lang="scss" scoped>

.type {
  width: 100%;
  height: 24px;
  text-align: center;
  border: 1px solid;
}

</style>
