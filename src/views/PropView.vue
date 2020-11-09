<template>
<!-- This component is meant for:
  1) Edition of Types
  2) Rudimentary display of Instances - they should be edited in their dedicated viewers
-->
  <div class="prop-wrapper">
    <div class="name">
      <!-- prefix cannot be added manually and wont be accepted -->
      <span class="ref-prefix"></span>
      <input type="text" v-model="_pDef.name">
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
    <div class="target-type"></div>
    <div class="arity-choice">
      <input type="checkbox" v-model="localProp.isArray" @change="maybeUpdate">
    </div>
    <div class="delete-prop"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import { act } from '@/store/transactions'

@Options({})
export default class PropertyTypeEditor extends Vue {
  @Prop() tId!: string
  @Prop() iId!: string

  @Prop() pDef!: PropDefinition
  get pV(): Values { return this.$store.getters.getPV({ tId: this, iId: this.iId, pN: this.pDef.name }) }

  changePropName(newName: string) {
    if (this.pDef.name === newName) return
    act('changePropName', this.getContext({ newName }))
  }
  changeType(newType: ValueType) {
    if (this.pDef.valueType === newType) return
    act('changePropType', this.getContext({ newType }))
  }
  changePropTargetType(newTargetId: string) {
    if (this.pDef.refTargetTypeId === newTargetId) return
    act('changePropTargetType', this.getContext({ newTargetId }))
  }
  changePropArity(isArray: boolean) {
    if (this.pDef.isArray === isArray) return
    if (isArray) act('changePropToArray', this.getContext({}))
    else act('changePropToSingle', this.getContext({}))
  }
  changeValue(value: number | boolean | string) {
    if (this.pV.includes(value)) return
    act('changePropValue', this.getContext({ value }))
  }
  addValue(value: number | boolean | string) {
    if (this.pV.includes(value)) return
    act('addPropValue', this.getContext({ value }))
  }
  removeValue(value: number | boolean | string) {
    if (!this.pV.includes(value)) return
    act('removePropValue', this.getContext({ value }))
  }

  // Universal sufficient parameters for every public action and getter
  getContext(p: { newName?: string, newType?: ValueType, newTargetId?: string, value?: string | boolean | number }): PublicActionContext {
    const { newName, newType, newTargetId, value } = p
    return {
      tId: this.tId,
      iId: this.iId,
      pN: this.pDef.name,
      newName,
      newType,
      newTargetId,
      value: value ? [value] : undefined,
    }
  }

  get basicTypes() { return ['int32', 'flt', 'string', 'bool', 'ref'] }

  get projectTypes() {
    return Object.keys(this.$store.getters.projectTypes)
  }

  get isRef() { return this.pDef.valueType === 'ref' }
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
