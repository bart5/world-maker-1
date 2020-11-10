<template>
  <ModalWrapper>
    <h4>Types Manager</h4>
    <hr>
    <button v-for="type in types" :key="type.id" @click="selectType(typeName)">{{ type.name }}</button>
    <hr>
    <h3 v-if="selectedType">Selected type: {{ selectedType.name }}</h3>
    <TypeView
      v-if="!!selectedType"
      :typeName="selectedTypeName"
    />
      <!-- :instanceId="instanceId" -->
    <hr>
    <h3>Type instances</h3>
    <button v-for="instanceId in selectedInstances" :key="instanceId" @click="selectInstance(instanceId)">{{ instanceId }}</button>
    <hr>
    <h3>Selected instance details</h3>
    <TypeView
      v-if="!!selectedType"
      :typeName="selectedTypeName"
      :instanceId="selectedInstanceId"
    />
    <hr>
    <hr>
    <h3>Raw selected type:</h3>
    {{ selectedType }}
    <hr>
    <h3>Raw types from project data:</h3>
    {{ projectTypes }}
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

  get types() {
    return this.$store.getters.types as TypeWrapper[]
  }

  get selectedType() {
    return this.$store.getters.getType({ tId: this.selectedTId })
  }

  get selectedInstance() {
    return this.$store.getters.getInstance({ iId: this.selectedIId })
  }

  selectType(tId: string) {
    this.selectedTId = tId
  }

  selectInstance(iId: string) {
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
