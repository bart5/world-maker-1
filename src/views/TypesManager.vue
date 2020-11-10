<template>
  <ModalWrapper>
    <h4>Types Manager</h4>
    <hr>
    <button v-for="type in types" :key="type.id" @click="selectType(typeName)">
      {{ type.name }}
    </button>
    <hr>
    <h3 v-if="selectedType">Selected type: {{ selectedType.name }}</h3>
    <TypeView
      v-if="!!selectedType"
      :typeName="selectedTypeName"
      :editable="true"
    />
      <!-- :instanceId="instanceId" -->
    <hr>
    <h3>Type instances</h3>
    <button v-for="instanceId in selectedInstances" :key="instanceId" @click="selectInstance(instanceId)">
      {{ instanceId }}
    </button>
    <hr>
    <h3>Selected instance details</h3>
    <TypeView
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
import TypeView from '@/views/TypeView.vue'

@Options({
  components: {
    ModalWrapper,
    TypeView
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

  get selectedInstances() {
    return this.$store.getters.getAllInstances(this.selectedTypeName)
  }

  selectType(typeName: string) {
    this.selectedTypeName = typeName
  }

  createNewType() {
    this.$store.dispatch('createType')
  }

  renameType(oldTypeName: string, newTypeName: string) {
    this.$store.dispatch('renameType', { oldTypeName, newTypeName })
  }

  removeType(typeName: string) {
    this.$store.dispatch('removeType', typeName)
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
