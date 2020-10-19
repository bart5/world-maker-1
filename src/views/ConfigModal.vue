<template>
  <ModalWrapper>
    <h4>App configuration</h4>
    <hr>
    <div class="input-wrapper">
      <div class="input-box">
        <div class="input-prefix">Default Projects path:</div>
        <input
          :class="{ 'validating': validatingDefaultLocalPath }"
          type="text"
          v-model="newApplicationData.defaultLocalPath"
          @change="validateProjectsDirectory"
        >
        <button class="file-dialog-button" @click="openSelectDirectoryDialog">B</button>
      </div>
    </div>
    <div class="input-wrapper">
      <label class="inbox-prefix">Use autosaves
        <input type="checkbox" v-model="newApplicationData.allowAutosave">
      </label>
    </div>
    <div class="input-wrapper">
      <label class="input-prefix">Autosave interval
        <input type="number" v-model="newApplicationData.autosaveInterval">
      </label>
    </div>
    <div class="input-wrapper">
      <label class="input-prefix">Use backups
        <input type="checkbox" v-model="newApplicationData.allowBackup">
      </label>
    </div>
    <div class="input-wrapper">
      <label class="input-prefix">Backup interval
        <input type="number" v-model="newApplicationData.backupInterval">
      </label>
    </div>
    <hr>
    <div class="button-wrapper">
      <button @click="setApplicationData" :disabled="!isDirty || !formIsValid">Save</button>
      <button @click="closeModal">Close</button>
    </div>
  </ModalWrapper>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import ModalWrapper from '@/views/ModalWrapper.vue'

@Options({
  components: {
    ModalWrapper,
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

<style lang="scss" scoped>
.input-wrapper {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  padding: 10px 0;

  .label, .input-prefix {
    user-select: none;
  }

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
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  .input-prefix {
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  input {
    margin-left: 6px;
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

.button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 25px;

  button {
    width: 120px;
    height: 26px;
    border: 1px solid darkgray;
    box-shadow: 0 0 1px 1px darkgray;
  }

  button.major {
    width: 100%;
    height: 38px;
    color: rgba(50,50,50);
    font-size: 16px;
    font-weight: bold;
  }
}

h6 {
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

</style>
