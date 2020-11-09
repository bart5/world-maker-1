<template>
<!-- This component is meant for:
  1) Edition of Types
  2) Rudimentary display of Instances - they should be edited in their dedicated viewers
-->
  <div class="prop-wrapper">
    <div class="name">
      <input type="text" v-model="localProp.name" @change="maybeUpdate">
    </div>
    <div class="values">
      <div class="values-box">
        <div class="top-field">
          <!-- Show first value if user is not interacting -->
          <div class="first-value">
            <span class="value"></span>
            <span class="is-more">...</span>
          </div>
          <!-- On interaction show input instead -->
          <div class="value-input">
            <input type="" :checked="" @click="" @change="">
          </div>
        </div>
        <!-- List is shown when user interacts with value field -->
        <div class="values-list">
          <!-- Button in top-right beyond the list to unroll or collapse it -->
          <div class="show-all-button"></div>
          <!-- Show current value(s) when you are in search mode -->
          <!-- Mark value on red if it's not array and it will be replaced -->
          <div class="value-selected">
            <div class="value"></div>
            <div class="remove-value-button"></div>
          </div>
          <!-- Below only for refs -->
          <div class="value-available"></div>
        </div>
      </div>
    </div>
    <div class="value-type">
      <input type="checkbox" :checked="isRef" @click="toggleRef" @change="maybeUpdate">
      <select class="selector type-selector" v-model="selectedType" @change="updatelocalProp(); maybeUpdate()">
        <option v-for="type in valueTypes" :key="type">{{ type }}</option>
      </select>
    </div>
    <div class="target-type">
    </div>
    <div class="arity-choice">
      <input type="checkbox" v-model="localProp.isArray" @change="maybeUpdate">
    </div>
    <div class="delete-prop"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator';
import ObjectDisplay from '@/views/ObjectDisplay.vue'

@Options({})
export default class PropertyTypeEditor extends Vue {
  @Prop() tId!: string
  @Prop() iId!: string
  @Prop() pDef!: PropDefinition

  get pV() {
    return this.$store.getters.getPV({ tId: this, iId: this.iId, pN: this.pDef.name })
  }

  _pDef: PropDefinition = { ...this.pDef }
  @Watch('pDef', { immediate: true })
  updatePDef(newPDef: PropDefinition) {
    this._pDef = { ...newPDef }
  }

  get _pN() { return this._pDef.name }
  get _pVT() { return this._pDef.valueType }
  get _pRTTID() { return this._pDef.refTargetTypeId }

  get context() {
    return {
      tId: this,
      iId: this.iId,
      pN: this.pDef.name,
      newName: this._pDef.name,
      newType: this._pDef.valueType,
      newTargetId: this._pDef.refTargetTypeId,
      value: this.pV,
    }
  }

  refTarget = '';

  showRefTarget = false;

  objectDisplay = ObjectDisplay

  selectedType: ValueType = this.localProp.valueType

  @Watch('_pVT')
  adjustNameToRefConvention(newType: ValueType) {
    if (newType === 'ref') {
      this._pN = this._pN.name.replace('ref_', '')
      this.localProp.isRef = false
    } else {

    }
  }

  onSelectType() {
    if (this._pDef.name.startsWith('ref_')) {
      this.localProp.name = this.localProp.name.replace('ref_', '')
      this.localProp.isRef = false
      delete this.localProp.refTargetTypeId
    } else {
      this.localProp.name = 'ref_' + this.localProp.name
      this.localProp.isRef = true
      this.localProp.valueType = 'int32'
      this.localProp.refTargetTypeId = this.projectTypes[0]
    }
  }

  toggleRef() {
    if (this.localProp.name.startsWith('ref_')) {
      this.localProp.name = this.localProp.name.replace('ref_', '')
      this.localProp.isRef = false
      delete this.localProp.refTargetTypeId
    } else {
      this.localProp.name = 'ref_' + this.localProp.name
      this.localProp.isRef = true
      this.localProp.valueType = 'int32'
      this.localProp.refTargetTypeId = this.projectTypes[0]
    }
  }

  toggleShowRefTarget() {
    this.showRefTarget = !this.showRefTarget
  }

  updatelocalProp() {
    console.log('updating local property')
    if (this.isRef && this.selectedType !== 'int32') {
      this.toggleRef()
    }
    this.localProp.valueType = this.selectedType
  }

  get isDisabled() {
    return this.prop.name.includes('meta_')
  }

  get basicTypes() {
    return [
      'int32', 'flt', 'string', 'bool'
    ]
  }

  get projectTypes() {
    return Object.keys(this.$store.getters.projectTypes)
  }

  get isRef() {
    return this.localProp.isRef
  }

  get isArray() {
    return this.localProp.isArray
  }

  get isDirty() {
    return this.prop.name !== this.localProp.name
      || this.prop.valueType !== this.localProp.valueType
      || this.prop.isArray !== this.localProp.isArray
  }

  maybeUpdate() {
    if (this.isDirty) this.updateProperty()
  }

  updateProperty() {
    this.$store.dispatch('updateTypeProperty', { oldPropName: this.prop.name, typeName: this.typeName, newProp: this.localProp })
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
