<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input
          :disabled="!edited"
          type="text"
          v-model="localProperty.name"
        >
      </div>
      <div class="type-field">
        <select
          :disabled="!edited"
          class="selector type-selector"
          v-model="localProperty.type"
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
          v-if="isTypeReference || isEnumReference"
          :disabled="!edited"
          class="selector type-reference"
          v-model="localProperty.type[isTypeReference ? 'typeRef' : 'enumRef']"
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
      @update-property="updateChildProperties"
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

  @Prop() order!: number

  @Prop() property!: Property

  localProperty: Property = { ...this.property }

  getNewProperty() {
    return {
      ...this.localProperty
    }
  }

  get basicTypes() {
    const typeRef = { name: 'typeRef', typeRef: '' }
    const enumRef = { name: 'enumRef', enumRef: '' }
    return [
      'char', 'uint', 'int', 'float', 'bool', typeRef, enumRef, 'struct', 'array'
    ]
  }

  get definedTypes() {
    return this.$store.getters.types
  }

  get isTypeReference() {
    const name = typeof this.localProperty.type === 'object' ? this.localProperty.type.name : undefined
    return name ? name === 'typeRef' : false
  }

  get isEnumReference() {
    const name = typeof this.localProperty.type === 'object' ? this.localProperty.type.name : undefined
    return name ? name === 'enumRef' : false
  }

  get isContainer() {
    return this.localProperty.type === 'struct' || this.localProperty.type === 'array'
  }

  updateChildProperties(properties: Property[]) {
    if (properties.length) {
      this.localProperty.children = [...properties]
    } else {
      delete this.localProperty.children
    }
  }

  sendToParent() {
    this.$emit('update-property', this.property)
  }

  selectProperty() {
    this.$emit('select-property', this.order)
  }
}
</script>

<style lang="scss" scoped>
</style>
