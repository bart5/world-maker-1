<template>
  <div class="object-wrapper">
    <div class="properties">
      <template v-if="entityType === 'type'">
        <PropertyTypeEditor
          v-for="prop in props"
          :prop="prop"
          :typeName="typeName"
          :key="typeName + prop.name"
          :editable="editable"
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

  showMeta = false

  get props() {
    return this.typeDefinition || this.typeInstnace as TypeDefinition | TypeInstance
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

  revertType() {
    /*  */
  }

  createTypeProperty() {
    this.$store.dispatch('createTypeProperty', this.typeName)
  }

  removeProperty(propName: string) {
    this.$store.dispatch('removeTypeProperty', { propName, typeName: this.typeName })
  }

  selectProp(propName: string) {
    this.selectedName = propName
  }

  toggleMeta() {
    this.showMeta = !this.showMeta
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
