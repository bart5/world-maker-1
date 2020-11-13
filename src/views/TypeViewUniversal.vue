<template>
  <div class="wrapper">
    <template v-if="!multiple">
      <TypeView
        :tId="tId || getInstanceTypeId()"
        :iId="iId"
        :alwaysMeta="showMeta"
        :neverMeta="neverMeta"
        :onlyValues="onlyValues"
      />
    </template>
    <template v-else>
      <TypeView
        v-for="instance in filteredInstances"
        :tId="instance.meta_typeId[0]"
        :iId="instance.id[0]"
        :key="instance.id[0]"
        :alwaysMeta="showMeta"
      />
      <TypeView
        v-for="typeWrapper in filteredTypes"
        :tId="typeWrapper.id"
        :key="typeWrapper.id"
        :alwaysMeta="showMeta"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import TypeView from '@/views/TypeView.vue'

@Options({
  components: {
    TypeView,
  },
})
export default class TypeViewUniversal extends Vue {
  @Prop({}) tId!: string
  @Prop({}) iId!: string | undefined
  @Prop() multiple!: boolean
  @Prop() types!: TypeWrapper[]
  @Prop() intances!: Instances[]
  @Prop() onlyValues!: boolean
  @Prop() neverMeta!: boolean
  @Prop() alwaysMeta!: boolean

  getInstanceTypeId() {
    this.$store.getters.getTypeId({ iId: this.iId })
  }

  filteredInstance: Instance[] = []
  filteredTypes: TypeWrapper[] = []
}
</script>

<style lang="scss" scoped>

.wrapper {
  max-height: 100%;
  overflow-y: scroll;
  width: 880px;
  background: lightgray;
  padding: 12px;
}

.tab-selector {
  display: flex;
  width: 100%;
}

</style>
