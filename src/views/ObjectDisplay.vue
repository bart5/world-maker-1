<template>
  <div class="object-wrapper">
    <button :disabled="isDirty" @click="submitChanges">Submit changes</button>
    <div class="properties">
      <template v-if="entityType === 'type'">
        <PropertyTypeEditor
          v-for="prop in props"
          :prop="prop"
          :key="prop.name"
          :editable="editable"
          @update-property="updateProp"
          @revert-property="revertProp"
          @select-property="selectProp"
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
    return this.typeDefinition || this.typeInstnace as TypeDefinition | TypesInstances
  }

  localProps: any = {}

  get isDirty() {
    return Object.keys(this.localProps).length > 0
  }

  get selectedProp(): PropDefinition | InstanceProp {
    return Object.keys(this.props).filter((k) => this.props[k].name === this.selectedName).map((k) => this.props[k])[0]
  }

  get typeDefinition(): TypeDefinition | null {
    return this.typeName ? this.$store.getters.getTypeDefinition(this.typeName) : null
  }

  get typeInstnace(): TypesInstances | null {
    return this.instanceId ? this.$store.getters.getTypesInstances(this.instanceId) : null
  }

  get entityType() {
    return this.instanceId ? 'instance' : 'type'
  }

  updateEntities() {
    if (this.entityType === 'type') {
      this.$store.dispatch('updateType', this.props)
    }
    if (this.entityType === 'instance') {
      this.$store.dispatch('updateTypesInstances', this.props)
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

  updateProp(newProp: PropDefinition | InstanceProp) {
    this.localProps[newProp.name] = {
      ...newProp
    }
  }

  revertProp(newProp: PropDefinition | InstanceProp) {
    if (newProp.name in this.localProps) {
      delete this.localProps[newProp.name]
    }
  }

  submitChanges() {
    Object.entries(this.localProps).forEach((p) => {
      if (this.entityType === 'type') {
        this.$store.dispatch('updateTypeProperty', p[1])
      } else if (this.entityType === 'instance') {
        this.$store.dispatch('updateInstanceProperty', p[1])
      }
    })
  }

  selectProp(propName: string) {
    this.selectedName = propName
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
