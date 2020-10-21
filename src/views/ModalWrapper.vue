<template>
  <div class="modal-overlay">
    <div class="modal">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class ModalWrapper extends Vue {
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  z-index: 1000;
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(200,200,200,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
  border: 2px solid;
  width: 700px;
  max-height: 80%;
  overflow-y: scroll;
  background: lightgray;
  padding: 15px 30px;

  h4 {
    user-select: none;
  }

  hr {
    margin-top: 24px;
    margin-bottom: 12px;
  }
}
</style>
