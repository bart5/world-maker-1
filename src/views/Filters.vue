<template>
  <div class="wrapper">

  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Options({
  components: {
  },
})
export default class TypesManager extends Vue {
  @Prop()

  iFilters = {
    iId: '', // instance id
    tId: '', // it's type id
    tN: '', // it's type name
    pN: '', // one of it's properties name
    isReferencing: '', // one of instances it references
    isReferencedBy: '', // one of instances that reference it
  }

  tFilters = {
    iId: '', // one of its instanced ids
    tId: '', // it's type id
    tN: '', // it's type name
    pN: '', // property name it includes
    isReferencing: '', // type it references
    isReferencedBy: '', // type it's referenced by
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
}

</style>
