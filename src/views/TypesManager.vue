<template>
  <ModalWrapper>
    <h4>Types Manager</h4>
    <hr>
    <button @click="createNewType">
      <h3>Create new Type</h3>
    </button>
    <hr>
    <h3>Types:</h3>
      <div class="type" v-for="type in types" :key="type.id">
        <button @click="selectType(type.id)">Select type: {{ type.name }}</button>
        <button @click="removeType(type.id)">Remove</button>
      </div>
    <hr>
    <h3>Selected type: {{ selectedType && selectedType.name }}</h3>
      <TypeView v-if="selectedType" :tId="selectedTId"/>
    <hr>
    <h3>Instances of selected type:</h3>
      <div class="instance" v-for="instance in selectedTypeInstances" :key="instance.id[0]">
        <button @click="selectInstance(instance.id[0])">{{ instance.id[0] }}</button>
        <button @click="removeInstance(instance.id[0])">Remove</button>
      </div>
    <hr>
    <h3>All Instances:</h3>
      <div class="instance" v-for="instance in allInstances" :key="instance.id[0]">
        <button @click="selectInstance(instance.id[0])">{{ instance.id[0] }}</button>
        <button @click="removeInstance(instance.id[0])">Remove</button>
      </div>
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

.type, .instance {
  width: 100%;
  height: 24px;
  text-align: center;
  border: 1px solid;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

</style>
