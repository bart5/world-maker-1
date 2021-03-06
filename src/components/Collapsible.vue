<template>
  <div class="collapsible-wrapper" :class="{ 'collapsed': !show }">
    <div class="header" :style="style" @click="toggle">
      <div class="title">{{ title }}</div>
      <div class="arrow" :class="{ 'down': show }">{{ ">" }}</div>
    </div>
    <div class="content" v-show="show">
      <slot></slot>
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

  show = !this.collapsed

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

.collapsible-wrapper {
  flex-grow: 1;
  height: auto;
  width: 100%;
  min-height: 50%; // Total height of sidebar / number of panels
  box-sizing: content-box;
  transition: min-height 0.2s, flex-grow 0.2s;

  &.collapsed {
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
  }

  .header {
    height: 28px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    border: 1px solid;
    padding: 0 14px;

    .title {
      font-weight: bold;
    }

    .arrow {
      user-select: none;
      font-size: 16px;
      display: block;
      line-height: 16px;
      height: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      transform: rotateZ(180deg);
      transition: transform 0.2s;

      &.down {
        transform: rotateZ(90deg);
      }
    }

    &:hover {
      cursor: pointer;
    }
  }

  .content {
    display: flex;
    flex-flow: column;
  }
}

</style>
