<template>
  <div class="object-wrapper">
    <div class="properties">
      <template v-if="entityType === 'type'">
        <PropertyTypeEditor
          v-for="keyedEntity in keyedEntities"
          :key="keyedEntity.id"
          :order="keyedEntity.order"
          :tempID="keyedEntity.id"
          :property="keyedEntity.enitty"
          :editable="editable"
          @update-property="updateEntity"
          @select-property="selectEntity"
        />
      </template>
      <!-- <template v-else>
        <PropertyInstanceEditor
          v-for="keyedEntity in keyedEntities"
          :key="keyedEntity.id"
          :order="keyedEntity.order"
          :property="keyedEntity.property"
          @update-property="updateEntity"
          @select-property="selectEntity"
        />
      </template> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import PropertyTypeEditor from '@/views/PropertyTypeEditor.vue'

@Options({
  components: {
    PropertyTypeEditor
  },
})
export default class ObjectDisplay extends Vue {
  @Prop() entities!: any[]

  /* Whether we show type structure or instance structure */
  @Prop() entityType!: 'type' | 'instance'

  /* null for not-top objects */
  /* It's the name of non-primitive type this whole structure describes */
  @Prop({ default: null }) typeName!: string | null

  @Prop() editable!: boolean

  @Prop({ default: false }) isTopObject!: boolean

  /* Defines way in which contained endities are organized. */
  /* Struct has it's entities keyed; array is a plain list. */
  @Prop({ default: 'struct' }) containerType!: 'struct' | 'array'

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

  updateEntities(entities: any[]) {
    if (this.isTopObject) {
      const descriptor: TypeDescriptor = { name: this.typeName as string, instance: entities, isEnum: false, extends: undefined }
      if (this.entityType === 'type') this.$store.dispatch('updateType', descriptor)
      if (this.entityType === 'instance') this.$store.dispatch('updateTypeInstance', descriptor)
    } else {
      this.$emit('update-entity', entities)
    }
  }

  getNewEntityTemplate(): PropertyType | PropertyInstance {
    if (this.entityType === 'type') {
      return {
        name: 'New Property',
        type: 'bool',
        order: this.entities.length
      }
    }
    return {
      name: 'New Property',
      type: 'bool',
      value: 'true'
    }
  }

  addNewEntity() {
    if (this.entityType === 'instance') return
    const newEntity = this.getNewEntityTemplate()
    this.updateEntities([
      ...this.entities,
      newEntity
    ])
  }

  removeEntity(tempID: string) {
    if (this.entityType === 'instance') return
    this.updateEntities([
      ...this.stripKeyed(this.keyedEntities.filter((ke) => ke.id !== tempID)),
    ])
  }

  updateEntity(changedkeyedEntity: { id: string, entity: any}) {
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
    if (this.entityType === 'instance') return
    const { entity } = this.selectedKeyedEntity
    if (!entity.order) return
    this.moveEntity(entity.order - 1)
  }

  /* Down means inrease order */
  moveEntityDown() {
    if (this.entityType === 'instance') return
    const { entity } = this.selectedKeyedEntity
    if (!entity.order) return
    if (entity.order === (this.entities.length - 1)) return
    this.moveEntity(entity.order + 1)
  }

  moveEntity(newOrder: number) {
    const currentOrder = this.selectedKeyedEntity.entity.order
    const moveDown = this.keyedEntities.filter((ke) => ke.order <= newOrder && ke.order > currentOrder)
    const moveUp = this.keyedEntities.filter((ke) => ke.order >= newOrder && ke.order < currentOrder)

    moveDown.forEach((ke) => { ke.order -= 1 })
    moveUp.forEach((ke) => { ke.order += 1 })

    this.updateEntities([
      ...this.stripKeyed([...moveDown, ...moveUp])
    ])
  }

  selectEntity(tempID: string) {
    const keyedEntity = this.keyedEntities.find((kp) => kp.id === tempID)
    if (keyedEntity) {
      this.selectedKeyedEntity = keyedEntity
    }
  }
}
</script>

<style lang="scss" scoped>
.object-wrapper {
  display: flex;
  flex-flow: column;
  width: 100%;
}

</style>
