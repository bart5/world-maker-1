<template>
  <div class="project-loader-overlay" v-if="openingProjectInProgress || savingProjectInProgress">
    <div class="indicator-box">
      <span>{{ notification }}</span>
      <div class="indicator"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

@Options({})
export default class ProjectLoader extends Vue {
  @Watch('openingProjectInProgress')
  projectOpenHandler(opening: boolean) {
    if (opening) {
      console.info('Opening project in progress.')
    } else {
      console.info('Project opened.')
      this.spawnNewProjectTiles()
    }
  }

  @Watch('savingProjectInProgress')
  projectSaveHandler(saving: boolean) {
    if (saving) {
      console.info('Saving current project in progress.')
    } else {
      console.info('Project saved.')
    }
  }

  get openingProjectInProgress() {
    return this.$store.getters.openingProjectInProgress
  }

  get savingProjectInProgress() {
    return this.$store.getters.savingProjectInProgress
  }

  get notification() {
    let msg = ''
    if (this.openingProjectInProgress) {
      msg = 'Loading project to the application...'
    }
    if (this.savingProjectInProgress) {
      msg = 'Saving project data...'
    }
    return msg
  }

  createNewTile(boardId: string, type: string, id: string) {
    this.$store.dispatch('createNewTile', { boardId, type: 'type', id })
  }

  spawnNewProjectTiles() {
    const boards: Boards = this.$store.getters.getAllBoards
    if (!Object.entries(boards).length) {
      console.warn('Project has no boards.')
      return
    }

    const types: TypeWrapper[] = this.$store.getters.types

    if (boards.types.tiles.length === 0) {
      types.forEach((tw) => this.createNewTile('types', 'types', tw.id))
    }
  }
}
</script>

<style lang="scss" scoped>
.project-loader-overlay {
  position: fixed;
  z-index: 1000;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.indicator-box {
  width: 260px;
  height: 120px;
  background: gray;
  display: flex;
  justify-content: center;
  align-items: center;

  .indicator {
    width: 80px;
    border-radius: 50%;
    border-top: 3px lightblue;
    border-bottom: 3px lightblue;
    animation: identifier 1s ease-out 0s infinite forwards forwards;

    @keyframes identifier {
      0% { transform: rotateZ(0deg) ;}
      100% { transform: rotateZ(720deg) ;}
    }
  }
}
</style>
