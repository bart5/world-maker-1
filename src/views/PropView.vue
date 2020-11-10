<template>
<!-- This component is meant for:
  1) Edition of Types
  2) Rudimentary display of Instances - they should be edited in their dedicated viewers
-->
  <div class="prop-wrapper">
    <div class="name" @click="startEdit('name')">
      <span v-if="!doesEdit('name')">{{ pDef.name }}</span>
      <input v-else type="text" :value="pDef.name.replace('ref_', '')" :ref="name-input"
        @input="getEValue(e, changePropName)" @keydown="validateNameInput"
      >
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
      <select class="type-selector" :value="pDef.valueType" @input="getEValue(e, changeType)">
        <option v-for="vType in valueTypes" :key="vType">{{ vType }}</option>
      </select>
    </div>
    <div class="target-type">
      <select class="target-selector" :value="targetName" @input="getEValue(e, changeType)">
        <option v-for="type in types" :key="type.id">{{ type.name }}</option>
      </select>
    </div>
    <div class="arity-choice">
      <input type="checkbox" :value="pDef.isArray" @click="changePropArity">
    </div>
    <div class="delete-prop">
      <button @click="removeProp">X</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import { act } from '@/store/transactions'

type EditType = 'name' | 'values' | 'type' | 'target' | ''

@Options({})
export default class PropertyTypeEditor extends Vue {
  @Prop() tId!: string
  @Prop() iId!: string

  @Prop() pDef!: PropDefinition
  get pV(): Values { return this.$store.getters.getPV({ tId: this, iId: this.iId, pN: this.pDef.name }) }

  get targetName() {
    return this.$store.getters.getTypeName(this.simpCtx)
  }

  changePropName(newName: string) {
    if (!this.nameIsValid) {
      console.error('Invalid new name')
      return
    }
    if (newName.startsWith('ref_') && !this.isRef) {
      console.error('Invalid new name')
      newName = newName.replace('ref_', '')
    } else if (this.pDef.name.startsWith('ref_') && !newName.startsWith('ref_')) {
      newName = 'ref_' + newName
    }
    if (this.pDef.name === newName) return
    act('changePropName', this.getCtx({ newName }))
  }
  changeType(newType: ValueType) {
    if (this.pDef.valueType === newType) return
    act('changePropType', this.getCtx({ newType }))
  }
  changePropTargetType(newTargetId: string) {
    if (this.pDef.refTargetTypeId === newTargetId) return
    act('changePropTargetType', this.getCtx({ newTargetId }))
  }
  changePropArity(isArray: boolean) {
    if (this.pDef.isArray === isArray) return
    if (isArray) act('changePropToArray', this.simpCtx)
    else act('changePropToSingle', this.simpCtx)
  }
  changeValue(value: number | boolean | string) {
    if (this.pV.includes(value)) return
    act('changePropValue', this.getCtx({ value }))
  }
  addValue(value: number | boolean | string) {
    if (this.pV.includes(value)) return
    act('addPropValue', this.getCtx({ value }))
  }
  removeValue(value: number | boolean | string) {
    if (!this.pV.includes(value)) return
    act('removePropValue', this.getCtx({ value }))
  }
  removeProp() {
    const accept = window.confirm('Do you really want to remove this property?\n Side effects accross project are possible.')
    if (!accept) return
    act('removeProp', this.simpCtx)
  }

  getEValue(e: UIEvent, cb: (v: any) => any, type: 'number' | 'bool') {
    const cast = (v: string) => (type ? (type === 'number' ? Number(v) : Boolean(v)) : v)
    cb(cast((e.target as HTMLInputElement).value))
  }

  editInProgress: EditType = ''

  nameIsValid = true

  get nameInput() {
    return this.$refs['name-input'] as HTMLInputElement
  }

  validateNameInput() {
    const nameInput = this.nameInput.value
    const insanityCheck = new RegExp(/[^a-Z]|ref/g)
    this.nameIsValid = !nameInput.match(insanityCheck)
  }

  startEdit(editType: EditType) {
    this.editInProgress = editType
  }

  doesEdit(editType: EditType) {
    return this.editInProgress === editType
  }

  // Universal sufficient parameters for every public action and getter
  getCtx(p: { newName?: string, newType?: ValueType, newTargetId?: string, value?: string | boolean | number }): PublicActionContext {
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

  get simpCtx() {
    return {
      tId: this.tId,
      iId: this.iId,
      pN: this.pDef.name
    }
  }

  get valueTypes() { return ['int32', 'flt', 'string', 'bool', 'ref'] }

  get types() {
    return this.$store.getters.types as TypeWrapper[]
  }

  get isRef() { return this.pDef.valueType === 'ref' }
}
</script>

<style lang="scss" scoped>
.prop-wrapper {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  height: 32px;
  padding: 2px;
  align-items: center;
  border: 1px solid slategray;

  & > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    padding: 1px;
    border: 1px solid darkgray;
  }
}

</style>
