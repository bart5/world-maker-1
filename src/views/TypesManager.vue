<template>
  <ModalWrapper>
    <h4>Types Manager</h4>
    <hr>
    <button
      class="type"
      v-for="typeName in projectTypes"
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
      :editable="true"
    />
      <!-- :instanceId="instanceId" -->
    <hr>
    <h3>Type instances</h3>
    <button
      class="type"
      v-for="instanceId in selectedTypeInstances"
      :key="instanceId"
      @click="selectInstance(instanceId)"
    >
      {{ instanceId }}
    </button>
    <hr>
    <h3>Selected instance details</h3>
    <ObjectDisplay
      v-if="!!selectedType"
      :typeName="selectedTypeName"
      :instanceId="selectedInstanceId"
      :editable="true"
    />
    <hr>
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

  selectedInstanceId = ''

  get projectTypes() {
    return this.$store.getters.projectTypes
  }

  get selectedType() {
    return this.projectTypes[this.selectedTypeName] || null
  }

  get selectedTypeInstances() {
    return this.$store.getters.getAllTypeInstances(this.selectedTypeName)
  }

  createNewType() {
    this.$store.dispatch('createNewType')
  }

  removeType() {
    this.$store.dispatch('removeType')
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
