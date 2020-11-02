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
          <option v-for="type in basicTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <select
          v-if="isRef"
          :disabled="!editable"
          class="selector type-reference"
          v-model="refTarget"
          @change="maybeSubmit"
        >
          <option v-for="type in projectTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="isArray-field">
        <input
          :disabled="!editable"
          type="checkbox"
          v-model="localProperty.isArray"
          @change="maybeSubmit"
        >
      </div>
      <div class="show-ref-target button">
        <button @click="toggleShowRefTarget"></button>
      </div>
    </div>
    <component
      v-if="isRef && showRefTarget"
      v-bind:is="objectDisplay"
      v-bind="displayProps"
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

  @Prop() property!: PropDefinition

  localProperty: PropDefinition = { ...this.property }

  refTarget = '';

  showRefTarget = false;

  objectDisplay = ObjectDisplay

  get displayProps() {
    return {
      typeName: this.refTarget,
      entityType: 'type',
      editable: this.editable,
    }
  }

  selectedType: ValueType | 'ref' = this.localProperty.valueType

  setRefTarget() {
    // eslint-disable-next-line prefer-destructuring
    this.refTarget = this.projectTypes[0]
  }

  toggleShowRefTarget() {
    this.showRefTarget = !this.showRefTarget
  }

  updateLocalProperty() {
    console.log('updating local property')
    if (this.selectedType === 'ref') {
      this.localProperty.valueType = 'int32'
      this.setRefTarget()
    } else {
      this.localProperty.valueType = this.selectedType
    }
  }

  get basicTypes() {
    return [
      'uint32', 'flt', 'string', 'bool', 'ref'
    ]
  }

  get projectTypes() {
    return Object.keys(this.$store.getters.projectTypes)
  }

  get isRef() {
    return this.localProperty.name.includes('ref_')
  }

  get isArray() {
    return this.localProperty.isArray
  }

  get isDirty() {
    return this.property.name !== this.localProperty.name
      || this.property.valueType !== this.localProperty.valueType
      || this.property.isArray !== this.localProperty.isArray
  }

  get style() {
    return {
      order: this.order
    }
  }

  maybeSubmit() {
    if (this.isDirty) {
      this.sendToParent()
    }
  }

  sendToParent() {
    this.$emit('update-property', { id: this.tempID, entity: this.localProperty, refTarget: this.refTarget })
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
