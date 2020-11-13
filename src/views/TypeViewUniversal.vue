<template>
  <div class="wrapper">
    <template v-if="!isMultiple">
      <TypeView
        :tId="tId || getInstanceTypeId()"
        :iId="iId"
        :alwaysMeta="showMeta"
        :neverMeta="neverMeta"
        :onlyValues="onlyValues"
      />
    </template>
    <template v-else>
      <template v-if="(onlyTypes && types.length) || (!onlyVlues && types.length)">
        <TypeView
          v-for="typeWrapper in types"
          :tId="typeWrapper.id"
          :key="typeWrapper.id"
          :alwaysMeta="showMeta"
          :neverMeta="neverMeta"
          :onlyTypes="true"
        />
      </template>
      <template v-else-if="(onlyValues && instances.length) || (!onlyTypes && instaces.length)">
        <TypeView
          v-for="instance in instances"
          :tId="instance.meta_typeId[0]"
          :iId="instance.id[0]"
          :key="instance.id[0]"
          :alwaysMeta="showMeta"
          :neverMeta="neverMeta"
          :onlyValues="true"
        />
      </template>
      <template>
        - No data to show -
      </template>
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
  @Prop() tId!: string
  @Prop() iId!: string | undefined
  @Prop() multiple!: boolean
  @Prop() types!: TypeWrapper[]
  @Prop() intances!: Instances[]
  @Prop() onlyValues!: boolean
  @Prop() onlyTypes!: boolean
  @Prop() neverMeta!: boolean
  @Prop() alwaysMeta!: boolean

  getInstanceTypeId() {
    this.$store.getters.getTypeId({ iId: this.iId })
  }

  get isMultiple() {
    return this.multiple || (!this.iId && !this.iId)
  }
}
</script>

<style lang="scss" scoped>
</style>
