<template>
  <div class="prop-wrapper" :style="{...order}" @keydown.esc="stopEdit()">

    <div class="name-field" @click="startEdit('name', $event)">
      <span v-if="!doesEdit('name')" class="name-text" :class="{ 'disabled': onlyValues | isMeta }">{{ pDef.name }}</span>
      <input v-else type="text" :value="localPDef.name.replace('ref_', '')" ref="nameInput"
        @change="getEValue($event, renameProp); stopEdit()" @keydown="validateNameInput"
      >
    </div>

    <div v-if="iId" class="values-field" @click="startEdit('values', $event)">
      <div class="values-box">

        <div class="top-field">
          <div v-if="!doesEdit('values')" class="first-value">
            <span class="value-text">{{ `${pV[0]}` }}</span>
            <div class="affix">
              <span v-if="pV.length > 1" class="is-more">{{ `(${(pV.length-1)} more)` }}</span>
              <span v-if="isRef && onlyValues" class="ref-affix">{{ `${refTargetName}` }}</span>
            </div>
          </div>

          <div v-else-if="isRef">
            <input type="text" v-model="instanceQuery" @keydown="searchInstances">
          </div>

          <template v-else>
            <div v-if="isBool" class="value-input">
              <input :value="pV[0] ? 'true' : 'false'" disabled>
            </div>

            <div v-else class="value-input">
              <input v-bind="valueInputAttributes" :disabled="readonly" @change="getEValue($event, changeValue, 'number')">
            </div>
          </template>
        </div>

        <div v-if="doesEdit('values') && (pV.length || isRef)" class="values-list">
          <div class="value-selected" v-for="value in pV" :key="value">
            <div class="value">{{ `${value}` }}</div>
            <div v-if="!readonly" class="remove-value-button">
              <button @click="removeValue(value)">X</button>
            </div>
          </div>
          <template v-if="isRef">
            <hr>
            <div class="value-available" v-for="instance in filteredInstances" :key="instance.is.value[0]">
              {{ instance.id.value[0] }}
            </div>
          </template>
          <template v-if="isBool">
            <hr>
            <div class="value-available" @click="changeValue(true)">{{ true }}</div>
            <div class="value-available" @click="changeValue(false)">{{ false }}</div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="!onlyValues" class="value-type">
      <select class="type-selector" :disabled="readonly" :value="localPDef.valueType" @change="getEValue($event, changeType)">
        <option v-for="vType in valueTypes" :key="vType">{{ vType }}</option>
      </select>
    </div>

    <div v-if="onlyValues" class="value-type short hover">
      <span>{{ localPDef.valueType + (localPDef.isArray ? '[]' : '') }}</span>
    </div>

    <div v-if="!onlyValues" class="arity-choice hover" :class="{ 'isArray': localPDef.isArray }">
      <div class="list">
        <div class="top-field" @click="!readonly && startEdit('arity', $event)">[ ]</div>
        <div v-if="doesEdit('arity')" class="values-list no-scroll">
          <div class="value-available" :class="{ 'selected': !localPDef.isArray }" @click="changePropArity(false)">Single</div>
          <div class="value-available" :class="{ 'selected': localPDef.isArray }" @click="changePropArity(true)">Array</div>
        </div>
      </div>
    </div>

    <div v-if="!onlyValues" class="target-type">
      <select class="target-selector" :disabled="readonly || !isRef" :value="localPDef.refTargetTypeId" @change="getEValue($event, changePropTargetType)">
        <option v-for="type in types" :key="type.id" :value="type.id">{{ type.name }}</option>
      </select>
    </div>

    <div v-if="!onlyValues" class="move-prop up">
      <button class="basic" @click="movePropUp" :disabled="readonly">&#8593;</button>
    </div>

    <div v-if="!onlyValues" class="move-prop down">
      <button class="basic" @click="movePropDown" :disabled="readonly">&#8595;</button>
    </div>

    <div v-if="!onlyValues" class="delete-prop">
      <button class="basic" @click="removeProp" :disabled="readonly">Remove</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator';
import { actions } from '@/store/transactions'

type FieldType = 'name' | 'values' | 'type' | 'target' | 'arity' | ''

@Options({})
export default class PropView extends Vue {
  @Prop() tId!: string
  @Prop() iId!: string
  @Prop() onlyValues!: boolean
  @Prop() pDef!: PropDefinition

  get pV(): Values { return this.$store.getters.getPV(this.simpCtx) }

  instanceQuery = ''
  queryIsValid = true
  editInProgress: FieldType = ''
  nameIsValid = true
  filteredInstances: Instance[] = []
  unwatch: any = null
  localPDef = { ...this.pDef }

  @Watch('pDef', { deep: true })
  updatelocalPDef() {
    this.localPDef = { ...this.pDef }
  }

  renameProp(newName: string) {
    if (!this.nameIsValid) {
      console.error('Invalid new name')
      return
    }
    if (this.pDef.name.startsWith('ref_') && this.isRef && !newName.startsWith('ref_')) {
      newName = 'ref_' + newName
    }
    if (this.pDef.name === newName) return
    actions.renameProp(this.getCtx({ newName }))
  }

  changeType(newType: ValueType) {
    if (this.pDef.valueType === newType) return
    actions.changePropType(this.getCtx({ newType }))
  }

  changePropTargetType(newTargetId: string) {
    if (this.pDef.refTargetTypeId === newTargetId) return
    actions.changePropTargetType(this.getCtx({ newTargetId }))
  }

  changePropArity(isArray: boolean) {
    if (this.pDef.isArray === isArray) return
    if (isArray) actions.changePropToArray(this.simpCtx)
    else actions.changePropToSingle(this.simpCtx)
  }

  changeValue(value: number | boolean | string) {
    if (this.pV.includes(value)) return
    actions.changePropValue(this.getCtx({ value }))
  }

  addValue(value: number | boolean | string) {
    if (this.pV.includes(value)) return
    actions.addPropValue(this.getCtx({ value }))
  }

  removeValue(value: number | boolean | string) {
    if (!this.pV.includes(value)) return
    actions.removePropValue(this.getCtx({ value }))
  }

  movePropUp() {
    actions.movePropUp(this.simpCtx)
  }

  movePropDown() {
    actions.movePropDown(this.simpCtx)
  }

  removeProp() {
    const accept = window.confirm('Do you really want to remove this property?\n Side effects accross project are possible.')
    if (!accept) return
    actions.removeProp(this.simpCtx)
  }

  getEValue(e: UIEvent, cb: (v: any) => any, type: 'number' | 'bool') {
    const cast = (v: string) => (type ? (type === 'number' ? Number(v) : Boolean(v)) : v)
    cb(cast((e.target as HTMLInputElement).value))
  }

  get nameInputEl() {
    return this.$refs.nameInput as HTMLInputElement
  }

  validateNameInput() {
    const name = this.nameInputEl.value
    const disallowed = new RegExp(/[^a-zA-Z]/g)
    this.nameIsValid = !name.match(disallowed) && !name.startsWith('ref') && !name.startsWith('meta')
  }

  startEdit(fieldType: FieldType, e: MouseEvent) {
    if (this.isId) return
    if (this.isMeta && (fieldType === 'name')) return
    if (this.onlyValues && !(fieldType === 'values')) return
    e.stopPropagation()
    if (fieldType === this.editInProgress) return
    if (this.unwatch) this.unwatch()

    this.editInProgress = fieldType

    const widgetKey = Math.random()
    this.$store.dispatch('setWidgetKey', { widgetKey }) // in order to active element from other components
    this.unwatch = this.$watch('activeWidgetKey', (newKey: number) => {
      if (newKey === widgetKey) return
      this.stopEdit()
      this.unwatch()
    })
  }

  stopEdit() {
    if (this.unwatch) this.unwatch()
    this.editInProgress = ''
  }

  doesEdit(fieldType: FieldType) {
    return this.editInProgress === fieldType
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
      value: (value !== undefined) ? [value] : undefined,
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

  get types() { return this.$store.getters.types as TypeWrapper[] }

  get isRef() { return this.pDef.valueType === 'ref' }

  get refTargetName() { return this.$store.getters.getType({ tId: this.pDef.refTargetTypeId })?.name }

  get isBool() { return this.pDef.valueType === 'bool' }

  get isMeta() { return this.pDef.name.startsWith('meta') }

  get isId() { return this.pDef.name === 'id' }

  get readonly() {
    return this.isMeta || this.isId
  }

  get valueInputAttributes() {
    const vType = this.pDef.valueType
    const isInt = vType === 'int32'
    const isFlt = vType === 'flt'
    const isStr = vType === 'string'

    const min = isInt ? '-2000000000' : isFlt ? '-2000000000' : ''
    const max = isInt ? '2000000000' : isFlt ? '2000000000' : ''
    const step = isInt ? '1' : isFlt ? '0.00001' : '1'
    const type = isStr ? 'text' : 'number'

    const int32 = { min, max, step, type }
    const float = { min, max, type }
    const string = { type }

    return {
      ...isInt ? int32 : {},
      ...isFlt ? float : {},
      ...isStr ? string : {}
    }
  }

  searchInstances() {
    this.queryIsValid = !this.instanceQuery.match(/[^a-zA-Z0-9 ]/)
    if (!this.queryIsValid) return

    const query = this.instanceQuery
    const tId = this.pDef.refTargetTypeId
    const iId = query.match(/[0-9]+/)?.shift()

    this.filteredInstances = this.$store.getters.filteredInstances({ tId, iId })
  }

  get activeWidgetKey() { return this.$store.getters.activeWidgetKey }

  get order() {
    return {
      order: this.pDef.order
    }
  }
}
</script>

<style lang="scss" scoped>
.prop-wrapper {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  height: 26px;
  align-items: center;
  border: 1px solid rgba(100,100,100);
  overflow-y: visible;
  justify-content: flex-start;
  border-bottom: none;

  &:last-child:first-child { // in case the row is lonely
    border: 1px solid rgba(100,100,100);
  }

  & > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    font-size: 14px;

    &:not(:first-child) {
      border-left: 1px solid rgba(100,100,100);
    }
  }

  .name-text, .value-text {
    width: 100%;
    text-align: left;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex-grow: 1;

    &:not(.disabled):hover {
      cursor: pointer;
    }
  }

  .name-field, .values-field {
    padding: 4px;
  }

  .name-field {
    width: 160px;
    flex-shrink: 0;

    input {
      width: 100%;
    }
  }
  .values-field {
    flex-grow: 1;
    min-width: 240px;
    position: relative;

    .values-box {
      display: flex;
      justify-content: flex-start;
      width: 100%;

      .top-field {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .first-value, .value-input, input {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .affix {
          display: flex;
          flex-flow: column;
          justify-content: center;
          font-size: 11px;
          white-space: nowrap;
          max-height: 100%;
        }
      }
    }
  }

  .values-list {
    font-size: 14px;
    position: absolute;
    right: 0;
    top: 100%;
    width: 85%;
    min-width: 60px;
    border-top: none;
    background: lightgray;
    display: flex;
    flex-flow: column nowrap;
    max-height: calc(6 * 24px);
    overflow-y: scroll;
    z-index: 2;
    box-shadow:
      3px 3px 4px 2px rgba(80,80,80, 0.4),
      -3px 3px 4px 2px rgba(80,80,80, 0.4);

    & > div {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 24px;
    }

    &.no-scroll {
      overflow: visible;
    }

    .value-selected {
      display: flex;
      width: 100%;
      justify-content: space-between;

      .value {
        margin-left: 6px;
        flex-grow: 1;
        text-align: left;
        height: 100%;
        display: flex;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .remove-value-button {
        background-color: rgba(255,0,0,0.22);
      }
    }

    .value-available {
      padding-left: 6px;
      order: 1;

      &.selected {
        order: 0;
        color: rgba(150,150,150)
      }

      &:not(.selected):hover {
        cursor: pointer;
        color: white;
        background: gray;
      }
    }
  }

  .value-type.short {
    min-width: 48px;
    font-size: 12px;
    padding-left: 2px;
  }

  .arity-choice {
    position: relative;
    font-weight: bold;
    min-width: 28px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:not(.isArray) .top-field {
      color: rgba(150,150,150, 0.35);
    }

    .list {
      height: 100%;
      width: 100%;

      .top-field {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .target-type {
    min-width: 90px;

    select {
      width: 100%;
    }
  }

  .move-prop {
    padding: 0 6px;
  }

  .delete-prop {
    padding: 0 6px;
    flex-grow: 1;
    justify-content: flex-end;
  }

  input {
    border: none;
    background: rgba(230,230,230);
    border-bottom: dashed 2px darkgray;
  }
  select {
    border: none;

    &:hover {
      cursor: pointer;
    }
  }
}

</style>
