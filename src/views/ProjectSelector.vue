<template>
  <div class="modal modal-wrapper">
    <div class="config-modal">
      <h4>Select Project</h4>
      <hr>
      <h6>New project</h6>
      <div class="new-project-button-wrapper">
        <button @click="startNewProject">Start new project</button>
      </div>
      <hr>
      <h6>Open existing project</h6>
      <div class="input-wrapper">
        <div class="label">Project pact</div>
        <input type="text" v-model="projectPath" @change="fetchProject">
        <button class="file-dialog-button" @click="selectFileDialog">B</button>
      </div>
      <div v-if="projectFileIsValid && !validatingProject">
        <button class="project-button" @click="openProjectFromPath(projectPath)">Open project under: {{ projectPath }}</button>
      </div>
      <div class="modal-buttons">
        <button @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { validateProjectDataKeys } from '@/store'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class ProjectSelector extends Vue {
  projectPath = ''

  projectFileIsValid = true

  validatingProject = false

  selectFileDialog() {
    this.$store.dispatch('openSelectFileDialog')
  }

  fetchProject() {
    this.validatingProject = true
    this.$store.dispatch('asyncFetchProject', this.projectPath).then((project: Project) => {
      this.projectFileIsValid = validateProjectDataKeys(project)
    }).catch(() => {
      console.warn('Could not load file from path')
      this.projectFileIsValid = false
    }).finally(() => {
      this.validatingProject = false
    })
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
  align-items: center;

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

.project-button {
  width: 70%;
  height: 28px;
  border: 1px solid;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 6px 0;
}

h6 {
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.new-project-button-wrapper {
  display: flex;
  justify-content: center;

  button {
    border: 1px solid gray;
    height: 32px;
  }
}
</style>
