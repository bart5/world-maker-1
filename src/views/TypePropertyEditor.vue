<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input
          :disabled="!edited"
          type="text"
          v-model="name"
        >
      </div>
      <div class="type-field">
        <select
          :disabled="!edited"
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
          :disabled="!edited"
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
      :edited="edited"
      :containerType="type"
      @update-from-child="updateFromChild"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class TypePropertyEditor extends Vue {
  @Prop() edited!: boolean

  @Prop() propOrder!: number

  property: Property | null = null

  name = 'New property'

  type: PropertyTypeDescriptor = 'bool'

  childProperties: Property[] | null = null

  setProperty() {
    this.property = {
      name: this.name,
      type: this.type,
      order: this.propOrder,
      ...this.childProperties ? { children: this.childProperties } : {},
    }
  }

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

  updateFromChild(properties: Property[]) {
    this.childProperties = properties
  }

  sendToParent() {
    this.$emit('update-from-child', this.property)
  }
}
</script>

<style lang="scss" scoped>
</style>
