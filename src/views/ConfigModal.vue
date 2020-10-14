<template>
  <div class="modal-wrapper" v-if="show">
    <div class="config-modal">
      <div class="input-wrapper">
        <div class="label">Project name</div>
        <input type="text" v-model="projectConfig.name">
      </div>
      <div class="input-wrapper">
        <div class="label">Local save path</div>
        <input type="text" v-model="projectConfig.localSavePath">
      </div>
      <div class="input-wrapper">
        <div class="label">Remote save path</div>
        <input type="text" v-model="projectConfig.remoteSavePath">
      </div>
      <div class="input-wrapper">
        <div class="label">Use autosaves</div>
        <input type="checkbox" v-model="projectConfig.allowAutosave">
      </div>
      <div class="input-wrapper">
        <div class="label">Autosave prefix</div>
        <input type="text" v-model="projectConfig.autosavePrefix">
      </div>
      <div class="input-wrapper">
        <div class="label">Autosave interval</div>
        <input type="number" v-model="projectConfig.autosaveInterval">
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
  initialProjectConfig: ProjectConfig = {
    ...this.$store.getters.currentProjectConfig
  }

  get isDirty() {
    return (Object.keys(this.projectConfig) as Array<keyof ProjectConfig>).some((k) => {
      return this.initialProjectConfig[k] !== this.projectConfig[k]
    })
  }

  get projectConfig(): ProjectConfig {
    return {
      ...this.$store.getters.currentProjectConfig
    }
  }

  saveProjectConfig() {
    this.$store.dispatch('saveProjectConfig', this.projectConfig)
  }

  closeModal() {
    if (this.isDirty) {
      const decision = window.confirm('You have unsaved changes. Close anyway?')
      if (decision) {
        this.$store.dispatch('closeConfigurationModal')
      }
    }
    this.$store.dispatch('closeConfigurationModal')
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
