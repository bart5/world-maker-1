<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input
          :disabled="!editable"
          type="text"
          v-model="localProp.name"
          @change="maybeSubmit"
        >
      </div>
      <div class="type-field">
        <select
          :disabled="!editable"
          class="selector type-selector"
          v-model="selectedType"
          @change="updatelocalProp(); maybeSubmit()"
        >
          <option v-for="type in basicTypes" :key="type">
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
          <option v-for="type in projectTypes" :key="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="isArray-field">
        <input
          :disabled="!editable"
          type="checkbox"
          v-model="localProp.isArray"
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
  @Prop() prop!: PropDefinition

  @Prop() editable!: boolean

  localProp: PropDefinition = { ...this.prop }

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

  selectedType: ValueType | 'ref' = this.localProp.valueType

  setRefTarget() {
    // eslint-disable-next-line prefer-destructuring
    this.refTarget = this.projectTypes[0]
  }

  toggleShowRefTarget() {
    this.showRefTarget = !this.showRefTarget
  }

  updatelocalProp() {
    console.log('updating local property')
    if (this.selectedType === 'ref') {
      this.localProp.valueType = 'int32'
      this.setRefTarget()
    } else {
      this.localProp.valueType = this.selectedType
    }
  }

  get basicTypes() {
    return [
      'int32', 'flt', 'string', 'bool', 'ref'
    ]
  }

  get projectTypes() {
    return Object.keys(this.$store.getters.projectTypes)
  }

  get isRef() {
    return this.localProp.name.includes('ref_')
  }

  get isArray() {
    return this.localProp.isArray
  }

  get isDirty() {
    return this.prop.name !== this.localProp.name
      || this.prop.valueType !== this.localProp.valueType
      || this.prop.isArray !== this.localProp.isArray
  }

  maybeSubmit() {
    if (this.isDirty) {
      this.sendToParent()
    }
  }

  sendToParent() {
    this.$emit('update-property', { oldPropName: this.prop.name, newProp: { ...this.localProp } })
  }

  selectProperty() {
    this.$emit('select-property', this.prop.name)
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
