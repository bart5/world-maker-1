<template>
  <div class="modal-wrapper" v-if="showConfigurationModal">
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
  initialProjectConfig: ProjectConfig | null = null

  get isDirty() {
    if (this.initialProjectConfig === null) {
      throw Error('Config is null')
    }
    return (Object.keys(this.projectConfig) as Array<keyof ProjectConfig>).some((k) => {
      return (this.initialProjectConfig as ProjectConfig)[k] !== this.projectConfig[k]
    })
  }

  get projectConfig(): ProjectConfig {
    return {
      ...this.$store.getters.currentProjectConfig
    }
  }

  get showConfigurationModal() {
    return this.$store.getters.showConfigurationModal
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

  mounted() {
    console.log('modal mounted')
    this.initialProjectConfig = {
      ...this.$store.getters.currentProjectConfig
    }
  }
}
</script>

<style lang="scss">
.modal-wrapper {
  z-index: 1000;
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
