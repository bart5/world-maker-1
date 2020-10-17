<template>
  <div class="modal modal-wrapper">
    <div class="config-modal">
      <h4>Select Project</h4>
      <hr>
      <h6>New project</h6>
      <div class="new-project-button-wrapper">
        <button @click="startNewProjectConfiguration">Configure new project</button>
      </div>
      <hr>
      <h6>Import existing project</h6>
      <div class="input-wrapper">
        <div class="label">Load from file</div>
        <input type="text" v-model="projectPath" @change="fetchProjectFromPath">
        <button class="file-dialog-button" @click="selectFileDialog">B</button>
      </div>
      <div v-if="projectFromPath && !loadingProjectFromPath">
        <button class="project-button" @click="openUnknownProject(projectPath)">Open project: {{ projectFromPath.name }}</button>
      </div>
      <hr>
      <h6>Known projects</h6>
      <template v-if="applicationData.projects.length">
        <template
          v-for="projectConfig in applicationData.projects"
          :key="projectConfig.id"
        >
          <button class="project-button" @click="openKnownProject(projectConfig.id)">{{ projectConfig.name }}</button>
        </template>
      </template>
      <span v-else>There are no known existing projects to load.</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
  },
})
export default class ProjectSelector extends Vue {
  projectPath = ''

  projectFromPath: Project | null = null

  loadingProjectFromPath = false

  get applicationData(): ApplicationData {
    return this.$store.getters.applicationData
  }

  selectFileDialog() {
    this.$store.dispatch('openSelectFileDialog')
  }

  fetchProjectFromPath() {
    this.loadingProjectFromPath = true
    this.$store.dispatch('asyncFetchProject', this.projectPath).then((project: Project) => {
      this.projectFromPath = project
    }).catch(() => {
      this.projectFromPath = null
    }).finally(() => {
      this.loadingProjectFromPath = false
    })
  }

  startNewProjectConfiguration() {
    this.$store.dispatch('startNewProjectConfiguration')
  }

  openUnknownProject(path: string) {
    this.$store.dispatch('asyncOpenUknownProjectFromPath', path)
  }

  openKnownProject(projectId: string) {
    this.$store.dispatch('asyncOpenKnownProjectFromId', projectId)
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
