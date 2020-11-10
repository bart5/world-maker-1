<template>
  <div class="type-wrapper">
    <template v-if="entityType === 'type'">
      <PropView
        v-for="(prop, pN) in instance"
        :tId="tId"
        :iId="iId"
        :pN="pN"
        :key="pN"
        @select-property="selectProp"
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

  get instance() {
    return this.$store.getters.getInstance(this.simpCtx)
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

  & > * {
    display: flex;
    flex-flow: column;
    width: 100%;
  }
}

</style>
