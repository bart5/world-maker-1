import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import ProjectLoader from '../views/ProjectLoader.vue';
import Quest from '../views/Quest.vue';
// import WorldMap from '../views/WorldMap.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Project Loaded',
    component: ProjectLoader,
  },
  {
    path: '/quest',
    name: 'Quest',
    component: Quest,
  },
  // {
  //   path: '/',
  //   name: 'WorldMap',
  //   component: WorldMap,
  // },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
