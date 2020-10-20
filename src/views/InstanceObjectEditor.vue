<template>
  <div>
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
@Prop() a!: number
}
</script>

<style lang="scss" scoped>
</style>
