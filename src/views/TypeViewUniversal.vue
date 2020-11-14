<template>
  <div class="wrapper">
    <template v-if="!isMultiple">
      <TypeView
        :tId="tId || getInstanceTypeId()"
        :iId="iId"
        :alwaysMeta="alwaysMeta"
        :neverMeta="neverMeta"
        :onlyValues="onlyValues"
      />
    </template>
    <template v-else>
      <template v-if="(onlyTypes && types.length) || (!onlyValues && types.length)">
        <TypeView
          v-for="typeWrapper in types"
          :tId="typeWrapper.id"
          :key="typeWrapper.id"
          :alwaysMeta="alwaysMeta"
          :neverMeta="neverMeta"
          :onlyTypes="true"
        />
      </template>
      <template v-else-if="(onlyValues && instances.length) || (!onlyTypes && instances.length)">
        <TypeView
          v-for="instance in instances"
          :tId="instance.meta_typeId[0]"
          :iId="instance.id[0]"
          :key="instance.id[0]"
          :alwaysMeta="alwaysMeta"
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
  @Prop({ default: [] }) types!: TypeWrapper[]
  @Prop({ default: [] }) instances!: Instances[]
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
