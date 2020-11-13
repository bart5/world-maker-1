<template>
  <div class="wrapper">
    <div class="header" :style="style" @click="toggle">
      <div class="title"></div>
      <div class="arrow"></div>
    </div>
    <div class="content">
      <slot v-show="show">
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Options({})
export default class Collapsible extends Vue {
  @Prop({ default: false }) collapsed!: boolean
  @Prop() title!: string
  @Prop({ default: false }) small!: boolean

  show = this.collapsed

  get style() {
    return {
      height: this.small ? '14px' : '28px'
    }
  }

  toggle() {
    this.show = !this.show
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
  max-height: 100%;
  width: 100%;

  .header {
    height: 28px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    .title {
      font-size: 18px;
      font-weight: bold;
    }

    .arrow {
      user-select: none;
      font-size: 16px;
      display: block;
      content: '>';
      transform: rotateZ(90deg);
    }

    &:hover {
      cursor: pointer;
    }
  }

  .content {
    display: flex;
  }
}

</style>
