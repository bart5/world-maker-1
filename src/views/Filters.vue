<template>
  <div class="wrapper">
    <template v-for="m in ['types', 'instances']" :key="m">
      <template v-if="m === mode">
        <div class="box">
          <div class="label"></div>
          <input type="text">
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Options({})
export default class TypesManager extends Vue {
  @Prop({ default: 'instances' }) mode!: 'types' | 'instances'

  filters = {
    instances: {
      iId: '', // instance id
      tId: '', // it's type id
      tN: '', // it's type name
      pN: '', // one of it's properties name
      isReferencing: '', // one of instances it references
      isReferencedBy: '', // one of instances that reference it
      isBound: '', // only instances that have actor bound
      isNotBound: '', // only instances that have no actor bound
      isBoundTo: '', // instances bound to spepcific actor Id
    },
    types: {
      iId: '', // one of its instanced ids
      tId: '', // it's type id
      tN: '', // it's type name
      pN: '', // property name it includes
      isReferencing: '', // type it references
      isReferencedBy: '', // type it's referenced by
    }
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
}

</style>
