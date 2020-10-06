<template>
  <div class="wrapper">
    <h3>Task editor</h3>
    <!-- <template v-for="fieldName in formFields" :key="fieldName">
      <div>
        <label>{{ fieldName }}</label>
        <input type="text" name="" id="">
      </div>
    </template> -->
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
// import { Prop } from 'vue-property-decorator';

@Options({
  components: {
  },
})
export default class TaskEditor extends Vue {
  // @Prop({ default: null }) selectedTask!: Task | null

  // @Prop() isNewTask!: boolean

  // get formFields() {
  //   if (this.selectedTask) {
  //     return Object.keys(this.selectedTask)
  //   }
  //   return {}
  // }
}
</script>

<style lang="scss">
.wrapper {
  * {
    user-select: none;
  }

  border: 1px solid blue;
}
</style>
