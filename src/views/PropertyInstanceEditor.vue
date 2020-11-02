<template>
  <div class="property-wrapper"  :style="style">
    <div class="property-box">
      <div class="name-field">
        <div class="name">
          {{ localProperty.name }}
        </div>
      </div>
      <div class="value-field">
        <template v-if="!isContainer">
          <div v-if="isPrimitiveType" class="value">
            <!-- Non-boolean -->
            <input
              v-if="localProperty.type !== 'bool'"
              :disabled="!editable"
              v-bind="valueInputAttributes"
              v-model="localProperty.value"
              @change="maybeSubmit"
            >
            <!-- Boolean -->
            <select
              v-else
              :disabled="!editable"
              v-model="localProperty.value"
              @change="maybeSubmit"
            >
              <option value="true" ><option/>
              <option value="false" ><option/>
            </select>
            <!-- Type info -->
            <div class="type">
              {{ localProperty.type }}
            </div>
          </div>
          <!-- Reference to types -->
          <div v-else>
            <select
              :disabled="!editable"
              class="selector type-instance"
              v-model="localProperty.value"
              @change="maybeSubmit"
            >
              <option
                v-for="instance in TypesInstancess"
                :key="instance.id"
                :value="instance.id"
              >
                {{ instance.id }}
              </option>
            </select>
          </div>
        </template>
      </div>
    </div>
    <component
      v-if="isContainer"
      v-bind:is="objectDisplay"
      v-bind="displayProps"
      @update-entity="updateChildProperties"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';
import ObjectDisplay from '@/views/ObjectDisplay.vue'

@Options({
  components: {},
})
export default class TypePropertyEditor extends Vue {
  @Prop() editable!: boolean

  @Prop() prop!: InstanceProp

  @Prop() typeName!: string

  localProperty: InstanceProp = { ...this.prop }

  objectDisplay = ObjectDisplay

  selectedRef = ''

  get propDef(): PropDefinition {
    return this.$store.getters.getTypeDefinition(this.typeName, this.prop.name)
  }

  get displayProps() {
    return {
      typeName: this.propDef.refTargetType,
      instanceId: this.selectedRef,
      entityType: 'instance',
      editable: this.editable,
    }
  }

  get isRef() {
    return this.localProperty
  }

  get isArray() {
    return this.prop.isArray
  }

  get valueInputAttributes() {
    const propType = this.prop.valueType
    const min = propType === 'int32' ? '-2000000000' : propType === 'flt' ? '-2000000000' : ''
    const max = propType === 'int32' ? '2000000000' : propType === 'flt' ? '2000000000' : ''
    const step = propType === 'int32' ? '1' : propType === 'flt' ? '0.00001' : '1'
    const type = propType === 'string' ? 'text' : 'number'

    const int32 = { min, max, step, type }
    const float = { min, max, type }
    const string = { type }

    return {
      ...propType === 'int32' ? int32 : {},
      ...propType === 'flt' ? float : {},
      ...propType === 'string' ? string : {}
    }
  }

  get TypeInstances() {
    return this.$store.getters.TypeInstances({ type: this.propDef.refTargetType })
  }

  get isDirty() {
    return this.prop.values.some((v) => this.prop.values.every((pv) => String(pv) !== String(v)))
  }

  get style() {
    return {
      order: this.propDef.order || 0
    }
  }

  maybeSubmit() {
    if (this.isDirty) this.sendToParent()
  }

  sendToParent() {
    this.$emit('update-property', { entity: this.localProperty })
  }
}
</script>

<style lang="scss" scoped>
.property-wrapper {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.property-box {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
