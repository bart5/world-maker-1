<template>
  <AppLoader/>
  <ProjectLoader/>
  <ConfigModal v-if="showConfigurationModal"/>
  <ProjectSelector v-if="showProjectSelectorModal"/>
  <Frame/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Frame from '@/components/Frame.vue';
import ConfigModal from '@/components/ConfigModal.vue';
import ProjectSelector from '@/components/ProjectSelector.vue';
import AppLoader from '@/components/AppLoader.vue';
import ProjectLoader from '@/components/ProjectLoader.vue';

@Options({
  components: {
    Frame,
    ConfigModal,
    ProjectSelector,
    AppLoader,
    ProjectLoader,
  },
})
export default class App extends Vue {
  get showConfigurationModal() {
    return this.$store.getters.activeModal === 'configuration'
  }

  get showProjectSelectorModal() {
    return this.$store.getters.activeModal === 'projectSelector'
  }
}
</script>

<style lang="scss">
@import '@/style/global.scss';

body {
  max-height: 100vh;
  margin: 0;
  box-sizing: border-box;
  max-width: 100vw;

  * {
    box-sizing: border-box;
  }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-flow: column;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
