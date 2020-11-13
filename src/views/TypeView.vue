<template>
  <div class="type-wrapper">
    <div class="type-config">
      <div class="meta-toggle" v-if="!noMeta">
        <span>Show meta:</span>
        <input v-model="showMeta" type="checkbox">
      </div>
    </div>
    <template v-for="(pDef, pN) in type.definition">
      <PropView
        v-if="!pN.includes('meta') || showMeta"
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

@Options({
  components: {
    PropView
  },
})
export default class TypeView extends Vue {
  @Prop({}) tId!: string
  @Prop({}) iId!: string | undefined
  @Prop({ default: false }) onlyValues!: boolean
  @Prop({ noMeta: false }) noMeta!: boolean

  showMeta = false

  get type(): TypeWrapper {
    return this.$store.getters.getType(this.simpCtx)
  }

  get simpCtx() {
    return {
      tId: this.tId,
      iId: this.iId,
    }
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
}
.meta-toggle {
  height: 16px;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
}
</style>
