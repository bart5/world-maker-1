<template>
  <div class="object-wrapper">
    <div class="properties">
      <TypePropertyEditor
        @update-property="updateProperties"
        @select-property="selectProperty"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class TypeObjectEditor extends Vue {
  @Prop({ default: false }) edited = false

  properties: Property[] = []

  keyedProperties: { [k: string]: Property } = {}

  selectedPropertyOrder: number | null = null

  beforeMount() {
    this.keyedProperties = this.getKeyedProperties()
  }

  getKeyedProperties() {
    return this.properties.reduce((acc, v) => ({ ...acc, [`${Date.now()}_${Math.random()}`]: v }), {})
  }

  addNewProperty() {
    this.properties.push(this.getNewPropertyTemplate())
  }

  getNewPropertyTemplate(): Property {
    return {
      name: 'New property',
      type: 'bool',
      order: this.properties.length
    }
  }

  updateProperties(property: Property) {

  }

  moveProperty(newOrder: number) {
    if (!this.selectedPropertyOrder) return
    const moveDown = this.properties.filter((p) => p.order <= newOrder && p.order > (this.selectedPropertyOrder as number))
    const moveUp = this.properties.filter((p) => p.order >= newOrder && p.order < (this.selectedPropertyOrder as number))

    moveDown.forEach((p) => { p.order -= 1 })
    moveUp.forEach((p) => { p.order += 1 })
  }

  selectProperty(order: number) {
    this.selectedPropertyOrder = order
  }
}
</script>

<style lang="scss" scoped>
</style>
