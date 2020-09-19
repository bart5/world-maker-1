<template>
  <div>
    {{ label }}
    <label class="switch">
      <input type="checkbox" :value="value" @input="$emit('checked', $event.target.checked)">
      <span class="slider round"></span>
    </label>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    label: String,
    value: Boolean,
  },
})
export default class Toggle extends Vue {}
</script>

<style scoped lang="scss">
  @import '@/style/toggle.scss'
</style>
