<template>
  <div class="map-wrapper">
    <h1>Quest</h1>
    <QuestTree></QuestTree>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import QuestTree from '@/views/QuestTree.vue';

@Options({
  components: {
    QuestTree,
  },
})
export default class Quest extends Vue {
}
</script>

<style lang="scss">
</style>
