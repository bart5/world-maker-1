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

  @Prop() tempID!: string

  @Prop() order!: number

  @Prop() property!: PropertyInstance

  localProperty: PropertyInstance = { ...this.property }

  objectDisplay = ObjectDisplay

  get displayProps() {
    return {
      entities: this.children || [],
      entityType: 'instance',
      editable: this.editable,
      containerType: this.localProperty.type,
    }
  }

  get isPrimitiveType() {
    return typeof this.localProperty.type === 'string'
      && ['char', 'uint', 'int', 'float', 'bool'].includes(this.localProperty.type)
  }

  get isTypeReference() {
    const name = typeof this.localProperty.type === 'object' ? this.localProperty.type.name : undefined
    return name ? name === 'typeRef' : false
  }

  get isContainer() {
    return this.localProperty.type === 'struct' || this.localProperty.type === 'array'
  }

  get valueInputAttributes() {
    const propType = this.localProperty.type
    const min = propType === 'uint' ? '0'
      : propType === 'int' ? '-2000000000'
        : propType === 'float' ? '-2000000000' : ''
    const max = propType === 'uint' ? '4000000000'
      : propType === 'int' ? '2000000000'
        : propType === 'float' ? '2000000000' : ''
    const step = propType === 'uint' ? '1' : '1'
    const type = propType === 'char' ? 'text' : 'number'

    const uint = { min, max, step, type }
    const int = { min, max, step, type }
    const float = { min, max, type }
    const char = { type }

    return {
      ...propType === 'uint' ? uint : {},
      ...propType === 'int' ? int : {},
      ...propType === 'float' ? float : {},
      ...propType === 'char' ? char : {}
    }
  }

  get children() {
    if (!this.isContainer) return []
    if (this.localProperty.type === 'struct') {
      return Object.keys(this.localProperty.value).map((k) => {
        return this.localProperty.value[k]
      })
    }
    return this.localProperty.value
  }

  get TypesInstancess() {
    return this.$store.getters.TypesInstancess({ type: this.localProperty.type })
  }

  get isDirty() {
    return this.property.value !== this.localProperty.value
  }

  get style() {
    return {
      order: this.order
    }
  }

  maybeSubmit() {
    if (this.isDirty) this.sendToParent()
  }

  updateChildProperties(properties: PropertyInstance[]) {
    if (!this.isContainer) return
    if (this.localProperty.type === 'struct') {
      properties.forEach((p) => {
        this.localProperty.value[p.name] = p
      })
    } else {
      this.localProperty.value = properties
    }
    this.sendToParent()
  }

  sendToParent() {
    this.$emit('update-property', { id: this.tempID, entity: this.localProperty })
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
