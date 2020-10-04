declare module '*.vue' {
  import { defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent>;
  export default component;
}

/*
  Added
  export declare type Vue<Props = unknown, Emits extends EmitsOptions = {}, DefaultProps = {}> = ComponentPublicInstance<Props, {}, {}, {}, {}, Emits, PublicProps, DefaultProps, true> & ClassComponentHooks & ComponentCustomProperties;
  to vue-class-component.d.ts for $store typing to work properly.

  Vuex shims for some reason don't work.
*/
