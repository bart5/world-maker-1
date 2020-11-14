<template>
  <div class="filters-wrapper">
    <div>Filter {{ mode }}</div>
    <div class="field-wrapper">
      <input type="text" placeholder="Instance Id" v-model="filters[mode].iId" @change="filter">

      <div class="list">
        <input placeholder="Type" :value="getTypeName(filters[mode].tId)" @click="startEdit('normalType', $event)">
        <div v-if="doesSelect('normalType')" class="values-list">
          <div class="value-available" @click="filters[mode].tId = ''; filter()">-None-</div>
          <div class="value-available" v-for="type in allTypes" :key="type.id" @click="filters[mode].tId = type.id; filter()">
            {{ type.name }}
          </div>
        </div>
      </div>

      <input type="text" placeholder="Property name" v-model="filters[mode].prop.pN" @change="filter">
      <input type="text" placeholder="Referencing instance of Id" v-model="filters[mode].isReferencingInstance" @change="filter">
      <input type="text" placeholder="Referenced by instance of Id" v-model="filters[mode].isReferencedByInstance" @change="filter">

      <div class="list">
        <input placeholder="Referencing given type" :value="getTypeName(filters[mode].isReferencingType)" @click="startEdit('referencedType', $event)">
        <div v-if="doesSelect('referencedType')" class="values-list">
          <div class="value-available" @click="filters[mode].isReferencingType = ''; filter()">-None-</div>
          <div
            class="value-available" v-for="type in allTypes" :key="type.id"
            @click="filters[mode].isReferencingType = type.id; filter()"
          >
            {{ type.name }}
          </div>
        </div>
      </div>

      <div class="list">
        <input placeholder="Referenced by given type" :value="getTypeName(filters[mode].isReferencedByType)" @click="startEdit('referencingType', $event)">
        <div v-if="doesSelect('referencingType')" class="values-list">
          <div class="value-available" @click="filters[mode].isReferencedByType = ''; filter()">-None-</div>
          <div
            class="value-available" v-for="type in allTypes" :key="type.id"
            @click="filters[mode].isReferencedByType = type.id; filter()"
          >
            {{ type.name }}
          </div>
        </div>
      </div>

      <div class="list">
        <input
          placeholder="Actor bounding"
          :value="(filters[mode].isBound && 'Only bound') || (filters[mode].isNotBound && 'Only not bound')"
          @click="startEdit('bounding', $event)"
        >
        <div v-if="doesSelect('bounding')" class="values-list">
          <div class="value-available" @click="filters[mode].isBound = ''; filters[mode].isNotBound = ''; filter()">-N/A-</div>
          <div class="value-available" @click="filters[mode].isBound = true; filters[mode].isNotBound = false; filter()">Bound</div>
          <div class="value-available" @click="filters[mode].isBound = false; filters[mode].isNotBound = true; filter()">Not bound</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

type FieldType = 'normalType' | 'referencedType' | 'referencingType' | 'bounding'

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
      prop: {
        pN: '', // one of it's properties name
      },
      isReferencingInstance: '', // one of instances it references
      isReferencedByInstance: '', // one of instances that reference it
      isReferencingType: '', // one of instances it references
      isReferencedByType: '', // one of instances that reference it
      isBound: '', // only instances that have actor bound
      isNotBound: '', // only instances that have no actor bound
      isBoundTo: '', // instances bound to spepcific actor Id
    },
    types: {
      iId: '', // one of its instanced ids
      tId: '', // it's type id
      tN: '', // it's type name
      pN: '', // property name it includes
      isReferencingInstance: '', // type it references
      isReferencedByInstance: '', // type it's referenced by
    }
  }

  typeSelectionInProgress: FieldType | '' = ''
  unwatch: any = null

  getTypeName(tId: string) {
    if (!tId) return null
    return this.$store.getters.getTypeName({ tId })
  }

  // Empty in meaning that all values are: ''
  isObjectEmpty(o: {[k: string]: any }): boolean {
    return Object.entries(o).every(([, value]) => {
      return typeof value === 'object' ? this.isObjectEmpty(value) : !value.length
    })
  }

  areFiltersEmpty() {
    return this.isObjectEmpty(this.filters[this.mode])
  }

  get allTypes() { return this.$store.getters.types as TypeWrapper[] }

  getFilteredInstances() {
    console.log('passing filters: ', this.filters.instances)
    return this.$store.getters.getFilteredInstances({ ...this.filters.instances }, this.intances || null)
  }

  getFilteredTypes() {
    return this.$store.getters.getFilteredTypes(this.filters.types, this.types || null)
  }

  filter() {
    this.stopEdit()
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

  startEdit(fieldType: FieldType, e: MouseEvent) {
    e.stopPropagation()
    if (fieldType === this.typeSelectionInProgress) return
    if (this.unwatch) this.unwatch()

    this.typeSelectionInProgress = fieldType

    const widgetKey = Math.random()
    this.$store.dispatch('setWidgetKey', { widgetKey }) // in order to active element from other components
    this.unwatch = this.$watch('activeWidgetKey', (newKey: number) => {
      if (newKey === widgetKey) return
      this.stopEdit()
      this.unwatch()
    })
  }

  stopEdit() {
    if (this.unwatch) this.unwatch()
    this.typeSelectionInProgress = ''
  }

  doesSelect(fieldType: FieldType) {
    return this.typeSelectionInProgress === fieldType
  }

  get activeWidgetKey() { return this.$store.getters.activeWidgetKey }
}
</script>

<style lang="scss" scoped>

.field-wrapper {
  display: flex;
  flex-flow: column wrap;
  max-height: 90px;
  padding: 8px;
  justify-content: center;
  align-items: center;

  & > * {
    flex-shrink: 0;
    flex-grow: 0;
    width: 32%;
  }
}

input, select {
  display: flex;
  flex-flow: column;
  margin: 2px 0;
}

input {
  height: 16px;
  order: 0;
  border: none;
}

select {
  height: 16px;
  border: none;
  background: white;
}

.list {
  position: relative;

  input {
    width: 100%;
  }
}

.values-list {
  font-size: 14px;
  position: absolute;
  right: 0;
  top: 100%;
  width: 85%;
  border-top: none;
  background: lightgray;
  display: flex;
  flex-flow: column nowrap;
  max-height: calc(6 * 24px);
  overflow-y: scroll;
  z-index: 2;
  box-shadow:
    3px 3px 4px 2px rgba(80,80,80, 0.4),
    -3px 3px 4px 2px rgba(80,80,80, 0.4);

  & > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 24px;
  }

  .value-selected {
    display: flex;
    width: 100%;
    justify-content: space-between;

    .value {
      margin-left: 6px;
      flex-grow: 1;
      text-align: left;
      height: 100%;
      display: flex;
      align-items: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .remove-value-button {
      background-color: rgba(255,0,0,0.22);
    }
  }

  .value-available {
    padding-left: 6px;

    &:hover {
      cursor: pointer;
      color: white;
      background: gray;
    }
  }
}

</style>
