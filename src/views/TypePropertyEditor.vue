<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input
          type="text"
          v-model="name"
        >
      </div>
      <div class="type-field">
        <select
          class="selector type-selector"
          v-model="type"
        >
          <option
            v-for="type in basicTypes"
            :key="type.name || type"
            :value="type"
          >
            {{ type.name || type }}
          </option>
        </select>
        <select
          v-if="!!type.name"
          class="selector type-reference"
          v-model="type"
        >
          <option
            v-for="type in definedTypes"
            :key="type.name || type"
            :value="type"
          >
            {{ type.name }}
          </option>
        </select>
      </div>
    </div>
    <ObjectTypeEditor
      v-if="isContainer"
      :containerType="type"
      @update-child="updateFromChild"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class TypePropertyEditor extends Vue {
  name = ''

  type: PropertyTypeDescriptor | null = null

  childStruct: { [k: string]: PropertyTypeDescriptor} | null = null

  childArray: Array<PropertyTypeDescriptor> | null = null

  get basicTypes() {
    const typeRef = { name: 'typeRef', typeRef: ''}
    const enumRef = { name: 'enumRef', enumRef: ''}
    return [
      'char', 'uint', 'int', 'float', 'bool', typeRef, enumRef, 'struct', 'array'
    ]
  }

  get definedTypes() {
    return this.$store.getters.types
  }

  get isContainer() {
    return this.type === 'struct' || this.type === 'array'
  }

  updateFromChild(childData: { [k: string]: PropertyTypeDescriptor} | Array<PropertyTypeDescriptor>) {
    if (Array.isArray(childData)) {
      this.childStruct = null
      this.childArray = childData
    } else {
      this.childStruct = childData
      this.childArray = null
    }
  }

  sendToParent() {
    this.$emit('update-prop-type', {
      key: this.name,
      type: this.type,
      ...this.childStruct ? { struct: this.childStruct } : {},
      ...this.childArray ? { array: this.childArray } : {},
    })
  }
}
</script>

<style lang="scss" scoped>
</style>
