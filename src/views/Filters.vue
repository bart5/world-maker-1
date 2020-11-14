<template>
  <div class="filters-wrapper">
    <template v-for="m in ['types', 'instances']" :key="m">
      <template v-if="m === mode">
        <div>Filter {{ m }}</div>
        <div class="field-wrapper">
          <div class="box">
            <div class="label">Instance Id</div>
            <input type="text" v-model="filters[m].iId" @change="filter">
          </div>
          <div class="box">
            <div class="label">Type Id</div>
            <input type="text" v-model="filters[m].tId" @change="filter">
            <select class="target-selector" v-model="filters[m].tId" @change="filter">
              <option v-for="type in allTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>
          <div class="box">
            <div class="label">Type name</div>
            <input type="text" v-model="filters[m].tN" @change="filter">
          </div>
          <div class="box">
            <div class="label">Propety name</div>
            <input type="text" v-model="filters[m].pN" @change="filter">
          </div>
          <div class="box">
            <div class="label">Is referencing {{ m.replace('es', 'e') }} of Id</div>
            <input type="text" v-model="filters[m].isReferencing" @change="filter">
          </div>
          <div class="box">
            <div class="label">Is referenced by {{ m.replace('es', 'e') }} of Id</div>
            <input type="text" v-model="filters[m].isReferencedBy" @change="filter">
          </div>
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

  areFiltersEmpty() {
    return Object.entries(this.filters[this.mode]).every(([, value]) => !value.length)
  }

  get allTypes() { return this.$store.getters.types as TypeWrapper[] }

  getFilteredInstances() {
    return this.$store.getters.getFilteredInstances({ ...this.filters.instances }, this.intances || null)
  }

  getFilteredTypes() {
    return this.$store.getters.getFilteredTypes(this.filters.types, this.types || null)
  }

  filter() {
    if (this.mode === 'instances') {
      if (this.areFiltersEmpty()) {
        this.$emit('update-instances', { instances: this.intances })
        return
      }
      this.$emit('update-instances', { instances: this.getFilteredInstances() })
    } else {
      if (this.areFiltersEmpty()) {
        this.$emit('update-types', { types: this.types })
        return
      }
      this.$emit('update-types', { types: this.getFilteredTypes() })
    }
  }
}
</script>

<style lang="scss" scoped>

.field-wrapper {
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  height: 120px;
}

.box {
  width: 40%;
  display: flex;
  flex-flow: column;
  border: 1px solid;
  background: lightgray;

  .label {
    order: 1;
    font-size: 11px;
  }

  input {
    height: 16px;
    order: 0;
  }
}

</style>
