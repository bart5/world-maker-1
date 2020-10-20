<template>
  <ModalWrapper>
  </ModalWrapper>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import ModalWrapper from '@/views/ModalWrapper.vue'

@Options({
  components: {
    ModalWrapper
  },
})
export default class TypesManager extends Vue {
  get projectTypes() {
    return this.$store.getters.projectTypes
  }
}
</script>

<style lang="scss" scoped>
</style>
