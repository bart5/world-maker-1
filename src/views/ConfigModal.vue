<template>
  <div class="modal-wrapper">
    <div class="config-modal">
      <hr>
      <h4>Project name</h4>
      <div class="input-wrapper">
        <label>Project name
          <input type="text">
        </label>
      </div>
      <hr>
      <h4>Save paths</h4>
      <h5>Manual save paths</h5>
      <h6>Local saves</h6>
      <div class="input-wrapper">
        <label>Use single path
          <input type="checkbox">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Path
          <input type="text">
        </label>
      </div>
      <div class="input-group">
        <div class="input-wrapper">
          <label>Project config path
              <input type="text">
          </label>
        </div>
        <div class="input-wrapper">
          <label>Static Data path
              <input type="text">
          </label>
        </div>
        <div class="input-wrapper">
          <label>Static Data mappings
              <input type="text">
          </label>
        </div>
      </div>
      <h6>Cloud saves</h6>
      <div class="input-wrapper">
        <label>Use single path
          <input type="checkbox">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Path
          <input type="text">
        </label>
      </div>
      <div class="input-group">
        <div class="input-wrapper">
          <label>Project config path
              <input type="text">
          </label>
        </div>
        <div class="input-wrapper">
          <label>Static Data path
              <input type="text">
          </label>
        </div>
        <div class="input-wrapper">
          <label>Static Data mappings
              <input type="text">
          </label>
        </div>
      </div>
      <h5>Auto save paths</h5>
      <div class="input-wrapper">
        <label>Use single path
          <input type="checkbox">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Path
          <input type="text">
        </label>
      </div>
      <div class="input-group">
        <div class="input-wrapper">
          <label>Project config path
              <input type="text">
          </label>
        </div>
        <div class="input-wrapper">
          <label>Static Data path
              <input type="text">
          </label>
        </div>
        <div class="input-wrapper">
          <label>Static Data mappings
              <input type="text">
          </label>
        </div>
      </div>
      <h4>Autosaves</h4>
      <div class="input-wrapper">
        <label>Autosaves
            <input type="checkbox">
        </label>
      </div>
      <div class="input-wrapper">
        <label>Autosave interval
            <input type="number">
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

  projectConfiguration: ProjectConfig = {
    name: '',
    id: '',
    savePaths: {
      localSavePaths: {
        staticData: '',
        staticDataMappings: ''
      },
      cloudSavePaths: {
        staticData: '',
        staticDataMappings: ''
      }
    },
    autosavePrefix: 'auto_',
    allowAutosave: true,
    autosaveInterval: 5,
  }

  saveProjectConfig() {
    if (!this.dirty) return
    this.$store.dispatch('saveProjectConfig', this.projectConfiguration)
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
