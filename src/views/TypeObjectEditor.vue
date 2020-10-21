<template>
  <div class="object-wrapper">
    <div class="properties">
      <TypePropertyEditor
        v-for="keyedEntity in keyedEntities"
        :key="keyedEntity.id"
        :property="keyedEntity.property"
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
  @Prop() getNewEntityTemplate!: () => any

  @Prop() updateEntities!: (newEntities: any[]) => void

  @Prop() entities!: any[]

  @Prop() entityType!: 'type' | 'value'

  @Prop() isEditor!: boolean

  @Prop() isTopObject!: boolean

  selectedKeyedEntity: any | null = null

  get keyedEntities(): Array<{ id: string, order: number, entity: any }> {
    return this.entities.reduce((acc, e, i) => {
      return [
        ...acc,
        this.getKeyedEntity(e, i)]
    }, [] as Array<{id: string, order: number, entity: any}>)
  }

  getKeyedEntity(entity: any, fallbackOrder: number) {
    return {
      id: `${Date.now()}_${Math.random()}`,
      order: entity.order || fallbackOrder,
      entity
    }
  }

  stripKeyed(keyedEntities: Array<{ id: string, order: number, entity: any }>) {
    return keyedEntities.map((ke) => ke.entity)
  }

  addNewEntity() {
    const newEntity = this.getNewEntityTemplate()
    this.updateEntities([
      ...this.entities,
      newEntity
    ])
  }

  removeEntity(tempID: string) {
    this.updateEntities([
      ...this.stripKeyed(this.keyedEntities.filter((ke) => ke.id !== tempID)),
    ])
  }

  updateEntity(changedkeyedEntity: { id: string, order: string, entity: any}) {
    const changedEntity = this.keyedEntities.find((ke) => ke.id === changedkeyedEntity.id)
    if (changedEntity) {
      this.updateEntities([
        ...this.entities,
        ...changedEntity.entity,
      ])
    }
  }

  /* Down means decrease order */
  moveEntityUp() {
    const { entity } = this.selectedKeyedEntity
    if (!entity.order) return
    this.moveEntity(entity.order - 1)
  }

  /* Down means inrease order */
  moveEntityDown() {
    const { entity } = this.selectedKeyedEntity
    if (!entity.order) return
    if (entity.order === (this.entities.length - 1)) return
    this.moveEntity(entity.order + 1)
  }

  moveEntity(newOrder: number) {
    /* You cannot reorder entities which have no order property */
    if (!this.selectedKeyedEntity || !this.entities[0].order) return
    const currentOrder = this.selectedKeyedEntity.entity.order
    const moveDown = this.keyedEntities.filter((ke) => ke.order <= newOrder && ke.order > currentOrder)
    const moveUp = this.keyedEntities.filter((ke) => ke.order >= newOrder && ke.order < currentOrder)

    moveDown.forEach((ke) => { ke.order -= 1 })
    moveUp.forEach((ke) => { ke.order += 1 })

    this.updateEntities([
      ...this.stripKeyed([...moveDown, ...moveUp])
    ])
  }

  selectProperty(tempID: string) {
    const keyedEntity = this.keyedEntities.find((kp) => kp.id === tempID)
    if (keyedEntity) {
      this.selectedKeyedEntity = keyedEntity
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
