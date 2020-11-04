<template>
  <div class="object-wrapper">
    <button class="button" :disabled="!isDirty" @click="submitChanges">Submit changes</button>
    <div class="properties">
      <template v-if="entityType === 'type'">
        <PropertyTypeEditor
          v-for="prop in props"
          :prop="prop"
          :key="typeName + prop.name"
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
import { Prop, Watch } from 'vue-property-decorator';
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

  @Watch('typeName')
  handle() {
    this.modifiedProps = {}
  }

  get props() {
    return this.typeDefinition || this.typeInstnace as TypeDefinition | TypeInstance
  }

  get isDirty() {
    return Object.keys(this.modifiedProps).length > 0
  }

  get selectedProp(): PropDefinition | InstanceProp {
    return Object.keys(this.props).filter((k) => this.props[k].name === this.selectedName).map((k) => this.props[k])[0]
  }

  get typeDefinition(): TypeDefinition | null {
    return this.instanceId ? null : this.$store.getters.getTypeDefinition(this.typeName)
  }

  get typeInstnace(): TypeInstance | null {
    return this.instanceId ? this.$store.getters.getTypeInstance(this.typeName, this.instanceId) : null
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

  addProp() {
    if (this.entityType === 'instance') return
    this.$store.dispatch('addNewTypeProperty', { typeName: this.typeName })
  }

  removeProp(propName: string) {
    if (this.entityType === 'instance') return
    this.$store.dispatch('removeTypeProp', { typeName: this.typeName, propName })
  }

  updateProp(p: { oldPropName: string, newProp: PropDefinition | InstanceProp, tempId: string }) {
    this.modifiedProps[p.oldPropName] = {
      ...p.newProp,
    }
  }

  revertProp(oldPropName: string) {
    if (oldPropName in this.modifiedProps) {
      delete this.modifiedProps[oldPropName]
    }
  }

  submitChanges() {
    Object.entries(this.modifiedProps).forEach((tuple) => {
      if (this.entityType === 'type') {
        this.$store.dispatch('updateTypeProperty', { oldPropName: tuple[0], typeName: this.typeName, newProp: tuple[1] })
      } else if (this.entityType === 'instance') {
        this.$store.dispatch('updateInstanceProperty', { typeName: this.typeName, instanceId: this.instanceId, newProp: tuple[1] })
      }
    })
    this.modifiedProps = {};
  }

  selectProp(propName: string) {
    this.selectedName = propName
  }

  createTypeProperty() {
    this.$store.dispatch('createTypeProperty', this.typeName)
  }

  removeProperty(propName: string) {
    this.$store.dispatch('removeTypeProperty', { propName, typeName: this.typeName })
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
