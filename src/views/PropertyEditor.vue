<template>
  <div>
    <div class="name-field">

    </div>
    <div class="value-field">

    </div>
    <div class="type-field">

    </div>
    <div class="valueType-field">

    </div>
    <div class="container-field">

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

  updateValue() {
    /*  */
  }

  get valueType() {
    return this._valueType
  }

  updateValueType() {
    /*  */
  }

  get type() {
    return this._type
  }

  updateType() {

  }

  get availableTypes() {
    /*  */
  }

  get availableValueTypes() {

  }

  get container() {
    return this._container
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
