<template>
  <ModalWrapper>
    <h4>Open Project</h4>
    <hr>
    <h6>New project</h6>
    <div class="button-wrapper">
      <button class="open-project-button major" @click="startNewProject">Start new project</button>
    </div>
    <hr>
    <h6>Open existing project</h6>
    <div class="input-wrapper">
      <!-- <div class="label">Project path</div> -->
      <div class="input-box">
        <span class="input-prefix">path:</span>
        <input
          type="text"
          v-model="projectPath"
          @change="validateProjectPath"
        >
        <button class="file-dialog-button" @click="selectFileDialog">B</button>
      </div>
    </div>
    <div class="button-wrapper major">
      <button
        class="open-project-button major"
        @click="openProjectFromPath(projectPath)"
        :disabled="!projectFileIsValid || validatingProject"
      >
        Open project from: {{ projectPath }}
      </button>
    </div>
    <hr>
    <div class="button-wrapper">
      <button class="close-button" @click="closeModal">Close</button>
    </div>
  </ModalWrapper>
</template>

<script lang="ts">
import { validateProjectDataKeys } from '@/store/utils'
import { Options, Vue } from 'vue-class-component'
import ModalWrapper from '@/components/ModalWrapper.vue'

@Options({
  components: {
    ModalWrapper,
  },
})
export default class ProjectSelector extends Vue {
  projectPath = ''

  projectFileIsValid = true

  validatingProject = false

  validationTimeoutId = 0

  selectFileDialog() {
    this.$store.dispatch('openSelectFileDialog').then(({ canceled, path }) => {
      if (canceled) return
      this.projectPath = path
    })
  }

  validateProjectPath() {
    if (this.validatingProject) {
      window.clearTimeout(this.validationTimeoutId)
    }

    this.validatingProject = true

    const id = window.setTimeout(() => {
      if (this.validationTimeoutId === id) {
        this.$store.dispatch('asyncFetchProject', this.projectPath).then((project: Project) => {
          this.projectFileIsValid = validateProjectDataKeys(project)
        }).catch(() => {
          console.warn('Could not load file from path')
          this.projectFileIsValid = false
        }).finally(() => {
          this.validatingProject = false
        })
      }
    }, 500)

    this.validationTimeoutId = id
  }

  startNewProject() {
    this.$store.dispatch('asyncOpenNewProject').then(() => {
      this.closeModal()
    })
  }

  openProjectFromPath(path: string) {
    this.$store.dispatch('asyncOpenProjectFromPath', path).then(() => {
      this.closeModal()
    })
  }

  closeModal() {
    this.$store.dispatch('closeModal')
  }
}
</script>

<style lang="scss" scoped>
.input-wrapper {
  display: flex;
  flex-flow: row wrap;
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
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  .input-prefix {
    font-size: 14px;
    margin-right: 4px;
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
