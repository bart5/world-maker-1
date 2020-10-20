<template>
  <div class="object-wrapper">
    <div class="properties">
      <TypePropertyEditor />
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
}
</script>

<style lang="scss" scoped>
</style>
