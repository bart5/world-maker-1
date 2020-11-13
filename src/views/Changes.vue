<template>
  <div class="wrapper">
    <h3>List of changes:</h3>
    <div v-for="(change, i) in recentChanges" :key="i"> Change of type: {{ change.actionType }}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({})
export default class Changes extends Vue {
  get recentChanges() {
    return this.$store.getters.recentChanges
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
  display: flex;
  width: 100%;
  flex-flow: column;
}

</style>
