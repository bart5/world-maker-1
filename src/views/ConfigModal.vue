<template>
  <div class="modal modal-overlay">
    <div class="config-modal">
      <h4>App configuration</h4>
      <div class="input-wrapper">
        <div class="label">Default Projects path</div>
        <div class="input-box">
          <input
            :class="{ 'validating': validatingDefaultLocalPath }"
            type="checkbox"
            v-model="newApplicationData.defaultLocalPath"
            @change="validateProjectsDirectory"
          >
          <button class="file-dialog-button" @click="openSelectDirectoryDialog">B</button>
        </div>
      </div>
      <div class="input-wrapper">
        <div class="label">Use autosaves</div>
        <input type="checkbox" v-model="newApplicationData.allowAutosave">
      </div>
      <div class="input-wrapper">
        <div class="label">Autosave interval</div>
        <input type="number" v-model="newApplicationData.autosaveInterval">
      </div>
      <div class="input-wrapper">
        <div class="label">Use backups</div>
        <input type="checkbox" v-model="newApplicationData.allowBackup">
      </div>
      <div class="input-wrapper">
        <div class="label">Backup interval</div>
        <input type="number" v-model="newApplicationData.backupInterval">
      </div>
      <div class="button-wrapper">
        <button @click="setApplicationData" :disabled="!isDirty || !formIsValid">Save</button>
        <button @click="closeModal">Close</button>
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
  newApplicationData = {} as ApplicationData

  defaultLocalPathIsValid = true;

  validatingDefaultLocalPath = false

  validationTimeoutId = 0

  get applicationData(): ApplicationData {
    return this.$store.getters.applicationData
  }

  get formIsValid() {
    return this.defaultLocalPathIsValid
      && !this.validatingDefaultLocalPath
  }

  get isDirty() {
    return (Object.keys(this.applicationData) as Array<keyof ApplicationData>).some((k) => {
      return this.applicationData[k] !== this.newApplicationData[k]
    })
  }

  setApplicationData() {
    this.$store.dispatch('asyncUpdateApplicationData', this.newApplicationData).then(() => {
      this.$store.dispatch('closeModal', 'configuration')
    }).catch((e) => {
      console.warn(`Could not update application data:\n${e}`)
    })
  }

  validateProjectsDirectory() {
    if (this.validatingDefaultLocalPath) {
      window.clearTimeout(this.validationTimeoutId)
    }

    this.validatingDefaultLocalPath = true

    const id = window.setTimeout(() => {
      if (this.validationTimeoutId === id) {
        this.$store.dispatch('asyncTestPath', this.newApplicationData.defaultLocalPath).then(() => {
          this.defaultLocalPathIsValid = true
        }).catch((e) => {
          console.warn(`Testing provided path failed:\n${e}`)
          this.defaultLocalPathIsValid = false
        }).finally(() => {
          this.validatingDefaultLocalPath = false
        })
      }
    }, 500)

    this.validationTimeoutId = id
  }

  openSelectDirectoryDialog() {
    this.$store.dispatch('openSelectDirectoryDialog').then((path) => {
      this.newApplicationData.defaultLocalPath = path
    })
  }

  closeModal() {
    if (this.isDirty) {
      const decision = window.confirm('You have unsaved changes. Close anyway?')
      if (!decision) return
    }
    this.$store.dispatch('closeModal', 'configuration')
  }

  beforeMount() {
    this.newApplicationData = { ...this.applicationData }
  }
}
</script>

<style lang="scss">
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
    font-size: 14px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    user-select: none;
    margin: 0;
    padding: 0;
  }

  .input-box {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  input {
    flex-grow: 1;
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
