<template>
  <div class="modal-wrapper" v-if="showConfigurationModal">
    <div class="config-modal">
      <h4>Project configuration</h4>
      <div class="input-wrapper">
        <div class="label">Project name</div>
        <input type="text" v-model="projectConfig.name">
      </div>
      <div class="input-wrapper">
        <div class="label">Local save path</div>
        <input type="text" v-model="projectConfig.localSavePath" @change="validatePath(projectConfig.localSavePath)">
      </div>
      <div class="input-wrapper">
        <div class="label">Remote save path</div>
        <input disabled="true" type="text" v-model="projectConfig.remoteSavePath">
      </div>
      <div class="input-wrapper">
        <div class="label">Use autosaves</div>
        <input type="checkbox" v-model="projectConfig.allowAutosave">
      </div>
      <div class="input-wrapper">
        <div class="label">Autosave interval</div>
        <input type="number" v-model="projectConfig.autosaveInterval">
      </div>
      <template v-if="newProjectConfigurationInProgress">
        <div class="modal-buttons">
          <button @click="saveProjectConfig" :disabled="!isDirty">Start Work</button>
          <button @click="openAnotherProject">Open Another Project</button>
        </div>
        <span v-if="true">
          You need a valid project configuration to proceed.
        </span>
      </template>
      <template v-else>
        <div class="modal-buttons">
          <button @click="saveProjectConfig" :disabled="!isDirty">Save</button>
          <button @click="closeModal">Close</button>
        </div>
      </template>
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

  projectConfig: ProjectConfig | null = null

  pathsAreValid = true;

  get newProjectConfigurationInProgress() {
    return this.$store.getters.newProjectConfigurationInProgress
  }

  get isDirty() {
    if (this.initialProjectConfig === null || this.projectConfig === null) {
      return Error('Config is null')
    }
    return (Object.keys(this.projectConfig) as Array<keyof ProjectConfig>).some((k) => {
      return (this.initialProjectConfig as ProjectConfig)[k] !== (this.projectConfig as ProjectConfig)[k]
    })
  }

  get showConfigurationModal() {
    return this.$store.getters.activeModal === 'Configuration'
  }

  saveProjectConfig() {
    this.$store.dispatch('saveProjectConfig', this.projectConfig)
    /* Maybe we should wait here to move files to new directories? */
    this.setModalState()
  }

  validatePath(path: string) {

  }

  setupProjectFiles() {
    /*
      We should try here move files to indicated directories.
      If project is completely new we can just try creating empty placeholders.
    */
  }

  closeModal() {
    if (this.isDirty) {
      const decision = window.confirm('You have unsaved changes. Close anyway?')
      if (!decision) return
    }
    this.$store.dispatch('closeModal', 'Configuration')
    this.setModalState()
  }

  openAnotherProject() {
    this.$store.dispatch('openModal', 'ProjectSelector')
  }

  setModalState() {
    this.initialProjectConfig = {
      ...this.$store.getters.currentProjectConfig
    }
    this.projectConfig = {
      ...(this.initialProjectConfig as ProjectConfig)
    }
  }

  mounted() {
    console.log('modal mounted')
    this.setModalState()
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
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  border: 2px solid;
  width: 700px;
  max-height: 80%;
  background: lightgray;
  padding: 15px 30px;

  h4 {
    user-select: none;
  }
}

.input-wrapper {
  display: flex;
  width: 100%;
  padding: 10px 0;

  .label {
    width: 150px;
    display: flex;
    justify-content: flex-start;
    user-select: none;
  }

  input {
    &:not([type='checkbox']) {
      flex-grow: 1;
    }

    &[type='checkbox']:hover {
      cursor: pointer;
    }
  }
}

.modal-buttons {
  margin-top: 25px;
  display: flex;
  width: 50%;
  justify-content: space-between;
  align-items: center;

  button {
    width: 120px;
    height: 26px;
    border: 1px solid darkgray;
  }
}

</style>
