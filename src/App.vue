<template>
  <div id="nav">
    <!-- <router-link to="/">World Map</router-link> | -->
    <router-link to="/">Quest</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view/>
</template>

<style lang="scss">
body {
  max-height: 100vh;
  display: flex;
  flex-flow: column;
  align-items: stretch;
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
