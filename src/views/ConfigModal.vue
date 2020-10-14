<template>
  <div class="modal-wrapper">
    <div class="config-modal">
      <div class="input-wrapper">
        <label>Project name
          <input type="text" v-model="projectConfig.name">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Local save path
          <input type="text" v-model="projectConfig.localSavePath">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Remote save path
          <input type="text" v-model="projectConfig.remoteSavePath">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Use autosaves
            <input type="checkbox" v-model="projectConfig.allowAutosave">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Autosave prefix
            <input type="text" v-model="projectConfig.autosavePrefix">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Autosave interval
            <input type="number" v-model="projectConfig.autosaveInterval">
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class ConfigModal extends Vue {
  dirty = false

  projectConfig: ProjectConfig = {
    name: '',
    id: '',
    localSavePath: '',
    remoteSavePath: '',
    autosavePrefix: 'auto_',
    allowAutosave: true,
    autosaveInterval: 5,
  }

  saveProjectConfig() {
    if (!this.dirty) return
    this.$store.dispatch('saveProjectConfig', this.projectConfig)
  }
}
</script>

<style lang="scss">
.modal-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(200,200,200,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.config-modal {
  width: 900px;
  max-height: 80%;
}

</style>
