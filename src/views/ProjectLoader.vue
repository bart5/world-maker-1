<template>
  <div class="project-loader-overlay" v-if="openingProjectInProgress || savingProjectInProgress">
    <div class="indicator-box">
      <span>{{ notification }}</span>
      <div class="indicator"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class ProjectLoader extends Vue {
  get openingProjectInProgress() {
    return this.$store.getters.openingProjectInProgress
  }

  get savingProjectInProgress() {
    return this.$store.getters.savingProjectInProgress
  }

  get notification() {
    let msg = ''
    if (this.openingProjectInProgress) {
      msg = 'Loading project to the application...'
    }
    if (this.savingProjectInProgress) {
      msg = 'Saving project data...'
    }
    return msg
  }
}
</script>

<style lang="scss" scoped>
.project-loader-overlay {
  position: fixed;
  z-index: 9999;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.indicator-box {
  width: 260px;
  height: 120px;
  background: gray;
  display: flex;
  justify-content: center;
  align-items: center;

  .indicator {
    width: 80px;
    border-radius: 50%;
    border-top: 3px lightblue;
    border-bottom: 3px lightblue;
    animation: identifier 1s ease-out 0s infinite forwards forwards;

    @keyframes identifier {
      0% { transform: rotateZ(0deg) ;}
      100% { transform: rotateZ(720deg) ;}
    }
  }
}
</style>
