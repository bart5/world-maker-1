<template>
  <div class="type-wrapper">
    <div class="type-header">
      <div class="name-wrapper">
        <template v-if="!showNameInput">
          <div class="type-name">{{ type.definition.name }}</div>
          <button @click="showNameInput=!showNameInput"></button>
        </template>
        <input v-else class="type-name-input" type="text" :value="localTypeName" ref="nameInput"
          @change="getEValue($event, renameType)" @keydown="validateNameInput"
        >
      </div>
    </div>
    <div class="type-config">
      <div>
        <button @click="remove">Delete</button>
      </div>
      <div class="meta-toggle" v-if="!neverMeta && !alwaysMeta">
        <span>Show meta:</span>
        <input :checked="showMeta" type="checkbox">
      </div>
    </div>
    <template v-for="(pDef, pN) in type.definition">
      <PropView
        v-if="!pN.includes('meta') || showMeta || alwaysMeta"
        :tId="tId"
        :iId="iId"
        :pDef="pDef"
        :key="pN"
        :onlyValues="onlyValues"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import PropView from '@/views/PropView.vue'
import { actions } from '@/store/transactions'

@Options({
  components: {
    PropView
  },
})
export default class TypeView extends Vue {
  @Prop({}) tId!: string
  @Prop({}) iId!: string | undefined
  @Prop({ default: false }) onlyValues!: boolean
  @Prop({ neverMeta: false }) neverMeta!: boolean
  @Prop({ alwaysMeta: false }) alwaysMeta!: boolean

  showMeta = false

  nameIsValid = true

  localTypeName = ''

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
}
</script>

<style lang="scss" scoped>
.type-wrapper {
  display: flex;
  flex-flow: column;
  width: 100%;
}
.type-config {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
}
.meta-toggle {
  height: 16px;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
}
</style>
