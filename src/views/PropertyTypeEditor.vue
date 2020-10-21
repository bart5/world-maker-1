<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input
          :disabled="!editable"
          type="text"
          v-model="localProperty.name"
          @change="maybeSubmit"
        >
      </div>
      <div class="type-field">
        <select
          :disabled="!editable"
          class="selector type-selector"
          v-model="localProperty.type"
          @change="maybeSubmit"
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
          :disabled="!editable"
          class="selector type-reference"
          v-model="localProperty.type[isTypeReference ? 'typeRef' : 'enumRef']"
          @change="maybeSubmit"
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
    <ObjectDisplay
      v-if="isContainer"
      :editable="editable"
      :containerType="type"
      @update-entity="updateChildProperties"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import ObjectDisplay from '@/views/ObjectDisplay.vue'

@Options({
  components: {
    ObjectDisplay
  },
})
export default class TypePropertyEditor extends Vue {
  @Prop() editable!: boolean

  @Prop() order!: number

  @Prop() property!: PropertyType

  localProperty: PropertyType = { ...this.property }

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

  get isDirty() {
    return this.property.name !== this.localProperty.name
      || this.property.type !== this.localProperty.type
  }

  maybeSubmit() {
    if (this.isDirty) this.sendToParent()
  }

  updateChildProperties(properties: PropertyType[]) {
    if (properties.length) {
      this.localProperty.children = [...properties]
      this.sendToParent()
    } else {
      delete this.localProperty.children
    }
  }

  sendToParent() {
    this.$emit('update-property', this.localProperty)
  }

  selectProperty() {
    this.$emit('select-property', this.order)
  }
}
</script>

<style lang="scss" scoped>
</style>
