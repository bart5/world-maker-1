<template>
  <div class="wrapper">
    <template v-for="m in ['types', 'instances']" :key="m">
      <template v-if="m === mode">
        <div>Filter {{ m }}</div>
        <div class="box">
          <div class="label">Instance Id</div>
          <input type="text" :value="filters[m].iId" @change="filter">
        </div>
        <div class="box">
          <div class="label">Type Id</div>
          <input type="text" :value="filters[m].tId" @change="filter">
          <select class="target-selector" v-model="filters[m].tId" @change="filter">
            <option v-for="type in allTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
        <div class="box">
          <div class="label">Type name</div>
          <input type="text" :value="filters[m].tN" @change="filter">
        </div>
        <div class="box">
          <div class="label">Propety name</div>
          <input type="text" :value="filters[m].pN" @change="filter">
        </div>
        <div class="box">
          <div class="label">Is referencing {{ m.replace('es', 'e') }} of Id</div>
          <input type="text" :value="filters[m].isReferencing" @change="filter">
        </div>
        <div class="box">
          <div class="label">Is referenced by {{ m.replace('es', 'e') }} of Id</div>
          <input type="text" :value="filters[m].isReferencedBy" @change="filter">
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Options({})
export default class Filteres extends Vue {
  @Prop({ default: 'instances' }) mode!: 'types' | 'instances'
  @Prop() types!: TypeWrapper[]
  @Prop() intances!: Instances[]

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

  get allTypes() { return this.$store.getters.types as TypeWrapper[] }

  getFilteredInstances() {
    return this.$store.getters.getFilteredInstances({ ...this.filters.instances }, this.intances || null)
  }

  getFilteredTypes() {
    return this.$store.getters.getFilteredTypes(this.filters.types, this.types || null)
  }

  filter() {
    console.log('updating')
    if (this.mode === 'instances') {
      this.$emit('update-instances', { instances: this.getFilteredInstances() })
    } else {
      this.$emit('update-types', { types: this.getFilteredTypes() })
    }
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
  display: flex;
  flex-flow: column;
}

</style>
