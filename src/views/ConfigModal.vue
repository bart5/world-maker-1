<template>
  <div class="modal-wrapper">
    <div class="config-modal">
      <h4>Project configuration</h4>
      <div class="input-wrapper">
        <div class="label">Project name</div>
        <input type="text" v-model="projectConfig.name">
      </div>
      <div class="input-wrapper">
        <div class="label">Local save path</div>
        <input
          :class="{
            'validating': pathValidations.local.validating,
            'invalid': !pathValidations.local.valid
          }"
          type="text"
          v-model="projectConfig.localSaveDirectory"
          @change="validatePath('local', projectConfig.localSaveDirectory)"
        >
      </div>
      <div class="input-wrapper">
        <div class="label">Remote save path</div>
        <input
          :class="{
            'validating': pathValidations.remote.validating,
            'invalid': !pathValidations.remote.valid
          }"
          disabled="true"
          type="text"
          v-model="projectConfig.remoteSaveDirectory"
        >
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
          <button @click="setupNewProject" :disabled="!isDirty || !formIsValid">Start Work</button>
          <button @click="openAnotherProject">Open Another Project</button>
        </div>
        <span v-if="!formIsValid">
          You need a valid project configuration to proceed.
        </span>
      </template>
      <template v-else>
        <div class="modal-buttons">
          <button @click="setProjectConfig" :disabled="!isDirty || !formIsValid">Save</button>
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

  pathValidations = {
    local: {
      valid: true,
      validating: false,
      delayedCallId: 0,
    },
    remote: {
      valid: true,
      validating: false,
      delayedCallId: 0,
    },
  }

  pathsAreValid = true;

  updatingProjectConfig = false;

  settingUpNewProject = false;

  get newProjectConfigurationInProgress() {
    return this.$store.getters.newProjectConfigurationInProgress
  }

  get formIsValid() {
    return this.pathValidations.local.valid
      && !this.pathValidations.local.validating
      && this.pathValidations.remote.valid
      && !this.pathValidations.remote.validating
  }

  get isDirty() {
    if (this.initialProjectConfig === null || this.projectConfig === null) {
      return Error('Config is null')
    }
    return (Object.keys(this.projectConfig) as Array<keyof ProjectConfig>).some((k) => {
      return (this.initialProjectConfig as ProjectConfig)[k] !== (this.projectConfig as ProjectConfig)[k]
    })
  }

  setupNewProject() {
    this.settingUpNewProject = true
    this.$store.dispatch('asyncSetupNewProject', this.projectConfig).then(() => {
      this.settingUpNewProject = false
      this.$store.dispatch('closeModal', 'configuration')
      this.$store.dispatch('stopNewProjectConfiguration')
    })
  }

  setProjectConfig() {
    this.updatingProjectConfig = true
    this.$store.dispatch('asyncSetProjectConfig', this.projectConfig).then(() => {
      this.updatingProjectConfig = false
      this.$store.dispatch('closeModal', 'configuration')
    })
  }

  validatePath(type: 'local' | 'remote', path: string) {
    if (this.pathValidations[type].validating) {
      window.clearTimeout(this.pathValidations[type].delayedCallId)
    }

    this.pathValidations[type].validating = true

    const id = window.setTimeout(() => {
      if (this.pathValidations[type].delayedCallId === id) {
        this.$store.dispatch('testPath', path).then(() => {
          this.pathValidations[type].valid = true
        }).catch(() => {
          this.pathValidations[type].valid = false
        }).finally(() => {
          this.pathValidations[type].validating = false
        })
      }
    }, 500)

    this.pathValidations[type].delayedCallId = id
  }

  closeModal() {
    if (this.isDirty) {
      const decision = window.confirm('You have unsaved changes. Close anyway?')
      if (!decision) return
    }
    this.$store.dispatch('closeModal', 'configuration')
  }

  openAnotherProject() {
    this.$store.dispatch('openModal', 'projectSelector')
  }

  setModalState() {
    const baseConfig = this.newProjectConfigurationInProgress
      ? this.$store.getters.newProjectConfig()
      : this.$store.getters.currentProjectConfig

    this.initialProjectConfig = { ...baseConfig }
    this.projectConfig = { ...(this.initialProjectConfig as ProjectConfig) }
  }

  beforeMount() {
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

    .invalid {
      background: rgba(255,0,0,0.2);
    }

    &.validating {
      position: relative;

      &:before {
        width: 10px;
        height: 100%;
        opacity: 0.5;
        position: absolute;
        background: linear-gradient(transparent 0px, lightblue 4px, blue 5px, lightblue 6px, transparent 10px);
        animation: 1.2s ease-out 0s infinite alternate kit;

        @keyframes kit {
          from { transform: left(0); }
          to   { transform: left(100%); }
        }
      }
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
