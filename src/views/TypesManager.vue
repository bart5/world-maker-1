<template>
  <ModalWrapper>
    <h4>Types Manager</h4>
    <hr>
    <h3>Types:</h3>
      <button v-for="type in types" :key="type.id" @click="selectType(typeName)">{{ type.name }}</button>
    <hr>
    <h3>Selected type: {{ selectedType && selectedType.name }}</h3>
      <TypeView v-if="selectedType" :tId="selectedTId"/>
    <hr>
    <h3>Instances of selected type:</h3>
      <button v-for="instance in selectedTypeInstances" :key="instance.id[0]" @click="selectInstance(instance.id[0])">{{ instance.id[0] }}</button>
    <hr>
    <h3>All Instances:</h3>
      <button v-for="instance in allInstances" :key="instance.id[0]" @click="selectInstance(instance.id[0])">{{ instance.id[0] }}</button>
    <hr>
    <h3>Selected instance:</h3>
      <TypeView v-if="selectedInstance" :tId="selectedITId" :iId="selectedIId"/>
    <hr>
    <h3>Raw types:</h3>
      {{ types }}
    <hr>
    <h3>Raw selected type:</h3>
      {{ selectedType }}
    <hr>
    <h3>List of changes:</h3>
      <div v-for="(change, i) in recentChanges" :key="i"> Change of type: {{ change.actionType }}</div>
  </ModalWrapper>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import ModalWrapper from '@/views/ModalWrapper.vue'
import TypeView from '@/views/TypeView.vue'
import { act } from '@/store/transactions'

@Options({
  components: {
    ModalWrapper,
    TypeView
  },
})
export default class TypesManager extends Vue {
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
    return this.$store.getters.getFilteredInstances({ tId: this.selectedTId })
  }

  get allInstances() {
    return this.$store.getters.getFilteredInstances({})
  }

  get selectedInstance() {
    return this.$store.getters.getInstance({ iId: this.selectedIId })
  }

  selectType(tId: string) {
    this.selectedTId = tId
  }

  selectInstance(tId: string, iId: string) {
    this.selectedITId = tId
    this.selectedIId = iId
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

  get recentChanges() {
    return this.$store.getters.recentChanges
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
