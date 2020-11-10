<template>
  <div class="type-wrapper">
    <PropView
      v-for="(pDef, pN) in type.definition"
      :tId="tId"
      :iId="iId"
      :pDef="pDef"
      :key="pN"
    />
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

  get type() {
    console.log('getting type with: ', this.simpCtx)
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

</style>
