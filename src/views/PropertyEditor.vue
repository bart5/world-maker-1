<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input :class="{ 'disabled': !inTypeEdition }" v-if="!inTypeEdition" type="text" v-model="_name" @change="updateName">
      </div>
      <div class="type-field">
        <select class="type-selector">
          <option v-for="type in availableTypes" :key="type.name" :value="type">
            {{ containValue(type.name) }}
          </option>
        </select>
      </div>
      <div v-if="!isContainer" class="value-field">
        <template v-if="isPrimitiveType">
          <input
            v-if="type.name !== 'bool'"
            v-bind="valueInputAttributes"
            :disabled="!isValueEditor"
            :class="{ 'disabled': !isValueEditor }"
          >
          <select
            v-else-if="type.name === 'bool'"
            :disabled="!isValueEditor"
            :class="{ 'disabled': !isValueEditor }"
          >
            <option value="true"></option>
            <option value="false"></option>
          </select>
        </template>
        <div v-else-if="isTypeReference">
          <select class="type-selector">
            <option v-for="typeInstance in availableTypeInstances" :key="typeInstance.id" :value="typeInstance">
              {{ typeInstance.id }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <ObjectEditor v-if="isContiner" :object="value" />
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

  get inTypeEdition() {
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

  get isContained() {
    return !!this._container
  }

  _name = 'New property'

  _value: any = ''

  _type: any = ''

  _type.name: any = ''

  _container: any = ''

  get name() {
    return this._name
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
    const min = this.type.name === 'uint' ? '0'
      : this.type.name === 'int' ? '-2000000000'
        : this.type.name === 'float' ? '-2000000000' : ''
    const max = this.type.name === 'uint' ? '4000000000'
      : this.type.name === 'int' ? '2000000000'
        : this.type.name === 'float' ? '2000000000' : ''
    const step = this.type.name === 'uint' ? '1' : '1'
    const type = this.type.name === 'char' ? 'text' : 'number'

    const uint = { min, max, step, type }
    const int = { min, max, step, type }
    const float = { min, max, type }
    const char = { type }

    return {
      ...this.type.name === 'uint' ? uint : {},
      ...this.type.name === 'int' ? int : {},
      ...this.type.name === 'float' ? float : {},
      ...this.type.name === 'char' ? char : {}
    }
  }

  get type.name() {
    return this._type.name
  }

  updatetype.name() {
    /*  */
  }

  get availabletype.names() {
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

  containValue(typeName: string) {
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
