import { Store } from 'vuex';

declare module '@vue/runtime-core' {
  // class MyStore extends Store<ApplicationState> { getters: { customGetter: () => number } }
  interface ComponentCustomProperties {
    $store: Store<ApplicationState>
  }
}
