<template>
  <DataLoader/>
  <ConfigModal/>
  <Frame/>
  <!-- <router-view/> -->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Frame from '@/views/Frame.vue';
import ConfigModal from '@/views/ConfigModal.vue';
import DataLoader from '@/views/DataLoader.vue';

@Options({
  components: {
    Frame,
    ConfigModal,
    DataLoader
  },
})
export default class App extends Vue {
}
</script>

<style lang="scss">
@import '@/style/global.scss';

body {
  max-height: 100vh;
  /* display: flex;
  flex-flow: column;
  align-items: stretch; */
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
