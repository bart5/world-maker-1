<template>
  <div class="object-wrapper">
    <div class="properties">
      <template v-if="entityType === 'type'">
        <PropertyTypeEditor
          v-for="prop in props"
          :key="prop.name"
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
  @Prop({ default: null }) typeName!: string | null

  @Prop({ default: null }) instanceId!: string | null

  @Prop() editable!: boolean

  selectedKeyedEntity: any | null = null

  selectedName = ''

  get props() {
    return this.typeDefinition || this.typeInstnace
  }

  get selectedProp(): PropDefinition | InstanceProp {
    return Object.keys(this.props).filter((k) => this.props[k].name === this.selectedName).map((k) => this.props[k])[0]
  }

  get typeDefinition(): TypeDefinition {
    return this.typeName ? this.$store.getters.getTypeDefinition(this.typeName) : null
  }

  get typeInstnace(): TypeInstance | null {
    return this.instanceId ? this.$store.getters.getTypeInstance(this.instanceId) : null
  }

  get entityType() {
    return this.instanceId ? 'instance' : 'type'
  }

  updateEntities() {
    if (this.entityType === 'type') {
      this.$store.dispatch('updateType', this.props)
    }
    if (this.entityType === 'instance') {
      this.$store.dispatch('updateTypeInstance', this.props)
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

  addProp() {
    if (this.entityType === 'instance') return
    this.$store.dispatch('addNewTypeProperty', { typeName: this.typeName })
  }

  removeProp(propName: string) {
    if (this.entityType === 'instance') return
    this.$store.dispatch('removeTypeProp', { typeName: this.typeName, propName })
  }

  updateProp(newProp: Partial<PropDefinition | InstanceProp>) {
    if (this.entityType === 'type') {
      this.$store.dispatch('updateTypeProperty', newProp)
    } else if (this.entityType === 'instance') {
      this.$store.dispatch('updateInstanceProperty', newProp)
    }
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

  .properties {
    display: flex;
    flex-flow: column;
    width: 100%;
  }
}

</style>
