<template>
  <div class="property-wrapper">
    <div class="property-box">
      <div class="name-field">
        <input
          :class="{ 'disabled': !inTypeEdition }"
          :disabled="!inTypeEdition"
          type="text"
          v-model="name"
          @change="updateName"
        >
      </div>
      <div class="type-field">
        <select
          :class="{ 'disabled': !inTypeEdition }"
          :disabled="!inTypeEdition"
          class="selector type-selector"
          v-model="type"
        >
          <option
            v-for="type in availableTypes"
            :key="type.name"
            :value="type"
          >
            {{ type.name }}
          </option>
        </select>
      </div>
      <!-- During type edition values does not exist -->
      <div v-if="!isContainer && !inTypeEdition" class="value-field">
        <template v-if="isPrimitiveType">
          <input
            v-if="type.name !== 'bool'"
            v-bind="valueInputAttributes"
            :disabled="!isValueEditor"
            :class="{ 'disabled': !isValueEditor }"
            v-model="value"
          >
          <select
            v-else-if="type.name === 'bool'"
            :disabled="!isValueEditor"
            :class="{ 'disabled': !isValueEditor }"
            v-model="value"
          >
            <option value="true"></option>
            <option value="false"></option>
          </select>
        </template>
        <div v-else-if="isTypeReference">
          <select class="selector instance-selector" v-model="value">
            <option v-for="typeInstance in availableTypeInstances" :key="typeInstance.id" :value="typeInstance">
              {{ typeInstance.id }}
            </option>
          </select>
        </div>
        <div v-else-if="isEnumType">
          <select class="selector enum-value-selector" v-model="value">
            <option v-for="value in enumValues" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <ObjectEditor v-if="isContiner" :object="value" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class TypePropertyEditor extends Vue {
  @Prop({ default: 'viewer' }) mode!: 'viewer' | 'valueEditor' | 'typeEditor'

  @Prop() property: any

  get isValueEditor() {
    return this.mode === 'valueEditor'
  }

  get inTypeEdition() {
    return this.mode === 'typeEditor'
  }

  get isViewer() {
    return this.mode === 'viewer'
  }

  get isPrimitiveType() {
    /*  */
  }

  get isTypeReference() {
    /*  */
  }

  get isEnumValue() {
    /*  */
  }

  get isContainer() {
    /*  */
  }

  name = ''

  value: any = ''

  type: ValueDescriptor = {
    name: 'char',
    value: 'asd'
  }

  get valueInputAttributes() {
    const min = this.type.name === 'uint' ? '0'
      : this.type.name === 'int' ? '-2000000000'
        : this.type.name === 'float' ? '-2000000000' : ''
    const max = this.type.name === 'uint' ? '4000000000'
      : this.type.name === 'int' ? '2000000000'
        : this.type.name === 'float' ? '2000000000' : ''
    const step = this.type.name === 'uint' ? '1' : '1'
    const type = this.type.name === 'char' ? 'text' : 'number'

    const uint = { min, max, step, type }
    const int = { min, max, step, type }
    const float = { min, max, type }
    const char = { type }

    return {
      ...this.type.name === 'uint' ? uint : {},
      ...this.type.name === 'int' ? int : {},
      ...this.type.name === 'float' ? float : {},
      ...this.type.name === 'char' ? char : {}
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
