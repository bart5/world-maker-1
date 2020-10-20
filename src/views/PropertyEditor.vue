<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input type="text">
      </div>
      <div v-if="!isTypeEditor" class="value-field">
        <template v-if="hasPrimitiveValue">
          <input
            v-if="valueType !== 'bool'"
            v-bind="valueInputAttributes"
          >
          <select v-else-if="valueType === 'bool'">
            <option value="true"></option>
            <option value="false"></option>
          </select>
        </template>
        <select v-else>
          <option v-for="type in availableTypes" :key="type.name" :value="type.name">
            {{ getValueContained(type.name) }}
          </option>
        </select>
      </div>
      <div class="valueType-field">
        <input v-if="isTypeEditor" type="text">
        <div v-if="isViewer"></div>
      </div>
      <div v-if="isTypeEditor" class="type-field">
        <input type="text">
      </div>
      <div v-if="isTypeEditor" class="container-field">
        <input type="text">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class PropertyEditor extends Vue {
  @Prop({ default: 'viewer' }) mode!: 'viewer' | 'valueEditor' | 'typeEditor'

  @Prop() property: any

  get isValueEditor() {
    return this.mode === 'valueEditor'
  }

  get isTypeEditor() {
    return this.mode === 'typeEditor'
  }

  get isViewer() {
    return this.mode === 'viewer'
  }

  get hasPrimitiveValue() {
    /*  */
  }

  get hasObjectValue() {
    /*  */
  }

  get hasEnumValue() {
    /*  */
  }

  _name = 'New property'

  _value: any = ''

  _type: any = ''

  _valueType: any = ''

  _container: any = ''

  get name() {
    return this._name
  }

  get isNameEditable() {
    return this.mode === 'typeEditor'
  }

  updateName() {
    /*  */
  }

  get value() {
    return this._value
  }

  get valueIsValid() {
    /*  */
  }

  updateValue() {
    /*  */
  }

  get valueInputAttributes() {
    const min = this.valueType === 'uint' ? '0'
      : this.valueType === 'int' ? '-2000000000'
        : this.valueType === 'float' ? '-2000000000' : ''
    const max = this.valueType === 'uint' ? '4000000000'
      : this.valueType === 'int' ? '2000000000'
        : this.valueType === 'float' ? '2000000000' : ''
    const step = this.valueType === 'uint' ? '1' : '1'
    const type = this.valueType === 'char' ? 'text' : 'number'

    const uint = { min, max, step, type }
    const int = { min, max, step, type }
    const float = { min, max, type }
    const char = { type }

    return {
      ...this.valueType === 'uint' ? uint : {},
      ...this.valueType === 'int' ? int : {},
      ...this.valueType === 'float' ? float : {},
      ...this.valueType === 'char' ? char : {}
    }
  }

  get valueType() {
    return this._valueType
  }

  updateValueType() {
    /*  */
  }

  get availableValueTypes() {
    /*  */
  }

  get type() {
    return this._type
  }

  updateType() {
    /*  */
  }

  get availableTypes() {
    /*  */
  }

  get container() {
    return this._container
  }

  updateContainer() {
    /*  */
  }

  getValueContained(typeName: string) {
    const prefix = this.container === 'struct'
      ? '{ '
      : '[ '
    const affix = this.container === 'struct'
      ? ' {'
      : ' ]'
    return prefix + typeName + affix
  }

  setProperty(property: any) {
    this._name = property.name
    this._value = property.value
    this._type = property.type
  }

  mounted() {
    if (this.property) this.setProperty(this.property)
  }
}
</script>

<style lang="scss" scoped>
</style>
