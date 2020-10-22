<template>
  <div class="property-wrapper" :style="style">
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
          v-model="selectedType"
          @change="updateLocalProperty(); maybeSubmit()"
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
          v-if="isTypeReference"
          :disabled="!editable"
          class="selector type-reference"
          v-model="localProperty.type.typeRef"
          @change="maybeSubmit"
        >
          <option
            v-for="type in projectTypes"
            :key="type.name || type"
            :value="type.name"
          >
            {{ type.name }}
          </option>
        </select>
      </div>
    </div>
    <component
      v-if="isContainer"
      v-bind:is="objectDisplay"
      v-bind="displayProps"
      @update-entity="updateChildProperties"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import ObjectDisplay from '@/views/ObjectDisplay.vue'

@Options({
  components: {},
})
export default class PropertyTypeEditor extends Vue {
  @Prop() editable!: boolean

  @Prop() tempID!: string

  @Prop() order!: number

  @Prop() property!: PropertyType

  localProperty: PropertyType = { ...this.property }

  objectDisplay = ObjectDisplay

  get displayProps() {
    return {
      entities: this.localProperty.children || [],
      entityType: 'type',
      editable: this.editable,
      containerType: this.localProperty.type,
    }
  }

  selectedType = typeof this.localProperty.type === 'string' ? this.localProperty.type : this.localProperty.type.name

  updateLocalProperty() {
    console.log('updating local property')
    if (this.selectedType === 'typeRef') {
      this.localProperty.type = {
        name: this.selectedType,
        typeRef: Object.entries(this.projectTypes)[0][0]
      }
    } else {
      this.localProperty.type = this.selectedType
    }
  }

  get basicTypes() {
    return [
      'char', 'uint', 'int', 'float', 'bool', 'typeRef', 'struct', 'array'
    ]
  }

  get projectTypes() {
    return this.$store.getters.projectTypes
  }

  get isTypeReference() {
    return this.selectedType === 'typeRef'
  }

  get isContainer() {
    return this.localProperty.type === 'struct' || this.localProperty.type === 'array'
  }

  get isDirty() {
    return this.property.name !== this.localProperty.name
      || this.property.type !== this.localProperty.type
  }

  get style() {
    return {
      order: this.order
    }
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
    this.$emit('update-property', { id: this.tempID, entity: this.localProperty })
  }

  selectProperty() {
    this.$emit('select-property', this.tempID)
  }
}
</script>

<style lang="scss" scoped>
.property-wrapper {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.property-box {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
