<template>
  <!-- <div v-if="type" class="type-wrapper"> -->
  <div class="type-wrapper">
    <div class="type-header">
      <div class="name-wrapper">
        <template v-if="!doesEdit('typeName')">
          <span class="name">{{ type.name }}</span>
          <span v-if="iId" class="id">({{ instance.id[0] }})</span>
          <button v-else class="basic small" @click="startEdit('typeName', $event)">Edit</button>
        </template>
        <input v-else class="type-name-input" type="text" :value="localTypeName" ref="nameInput"
          @click="startEdit('typeName', $event)" @change="getEValue($event, renameType)" @keydown="validateNameInput"
        >
      </div>
      <div class="type-config">
        <div class="meta-toggle" v-if="!neverMeta && !alwaysMeta">
          <label class="hover">Show meta:
            <input v-model="showMeta" type="checkbox">
          </label>
        </div>
        <div>
          <button class="basic small" @click="remove">Remove {{ isType ? 'type' : 'instance' }}</button>
        </div>
      </div>
    </div>
    <div class="props-wrapper">
      <template v-for="(pDef, pN) in type.definition">
        <PropView
          v-if="pN !== 'id' && (!pN.startsWith('meta') || showMeta || alwaysMeta)"
          :tId="tId"
          :iId="iId"
          :pDef="pDef"
          :key="pN"
          :onlyValues="onlyValues"
        />
      </template>
    </div>
    <button class="basic" @click="addProp">Add Prop</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import PropView from '@/views/PropView.vue'
import { actions } from '@/store/transactions'

type FieldType = '' | 'typeName'

@Options({
  components: {
    PropView
  },
})
export default class TypeView extends Vue {
  @Prop() tId!: string
  @Prop() iId!: string | undefined
  @Prop() onlyValues!: boolean
  @Prop() neverMeta!: boolean
  @Prop() alwaysMeta!: boolean

  showMeta = false
  nameIsValid = true
  localTypeName = ''
  showNameInput = false

  fieldType: FieldType = ''
  editInProgress: FieldType = ''
  unwatch: any = null

  get isType() {
    return !this.iId
  }

  updateTypeName() {
    this.localTypeName = this.type.name
  }

  get type(): TypeWrapper {
    return this.$store.getters.getType(this.simpCtx)
  }

  get instance(): TypeWrapper {
    return this.$store.getters.getInstance(this.simpCtx)
  }

  get simpCtx() {
    return {
      tId: this.tId,
      iId: this.iId,
    }
  }

  remove() {
    if (this.isType) {
      const confirm = window.confirm(`You are about to remove type ${this.type.name}. Are you certain?`)
      if (!confirm) return
      actions.removeType(this.simpCtx)
    } else {
      const confirm = window.confirm(`You are about to remove instance ${this.instance.id[0]}. Are you certain?`)
      if (!confirm) return
      actions.removeInstance(this.simpCtx)
    }
  }

  getEValue(e: UIEvent, cb: (v: any) => any, type: 'number' | 'bool') {
    const cast = (v: string) => (type ? (type === 'number' ? Number(v) : Boolean(v)) : v)
    cb(cast((e.target as HTMLInputElement).value))
  }

  get nameInputEl() {
    return this.$refs.nameInput as HTMLInputElement
  }

  renameType(newName: string) {
    if (!this.nameIsValid) return
    actions.renameType({ tId: this.tId, newName })
    this.updateTypeName()
    this.stopEdit()
  }

  getIsNameUnique(name: string) {
    return this.$store.getters.getIsTypeNameUnique(name)
  }

  validateNameInput() {
    const name = this.nameInputEl.value
    const disallowed = new RegExp(/[^a-zA-Z]/g)
    this.nameIsValid = !name.match(disallowed) && this.getIsNameUnique(name)
  }

  mounted() {
    this.updateTypeName()
  }

  startEdit(fieldType: FieldType, e: MouseEvent) {
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

  addProp() {
    actions.createProp(this.simpCtx)
  }

  get activeWidgetKey() { return this.$store.getters.activeWidgetKey }
}
</script>

<style lang="scss" scoped>
.type-wrapper {
  display: flex;
  flex-flow: column;
  width: 100%;
  padding: 12px;
  border: 1px solid;

  .type-header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: flex-start;
    height: 34px;

    .name-wrapper {
      display: flex;
      align-items: center;
      flex-grow:1 ;

      .id {
        margin-left: 4px;
        font-size: 14px;
        user-select: text;
      }

      button {
        margin-left: 4px;
      }

      input {
        border: none;
      }
    }
    .type-config {
      flex-grow: 0;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      width: 240px;
    }
  }

  .props-wrapper {
    border-bottom: 1px solid rgba(100,100,100);
    display: flex;
    flex-flow: column;
  }
}
.meta-toggle label {
  font-size: 14px;
  height: 16px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
</style>
