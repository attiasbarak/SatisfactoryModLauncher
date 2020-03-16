import Vue from 'vue';
import Router from 'vue-router';

// eslint-disable-next-line import/no-unresolved
const Launcher = require('@/components/Launcher/Launcher');
// eslint-disable-next-line import/no-unresolved
const GetMods = require('@/components/GetMods/GetMods');

Vue.use(Router);

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Launcher.default,
    },
    {
      path: '/get-mods',
      component: GetMods.default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
