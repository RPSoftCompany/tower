import Vue from 'vue'
import Router from 'vue-router'

import Settings from './views/Settings.vue'

Vue.use(Router)

const router = new Router({
  base: '/ui/',
  routes: [
    {
      path: '/timearchive',
      name: 'Time Archive',
      component: () => import('./views/TimeArchive.vue')
    },
    {
      path: '/archive',
      name: 'Version Archive',
      component: () => import('./views/Archive.vue')
    },
    {
      path: '/findvariable',
      name: 'Find Variable',
      component: () => import('./views/FindVariable')
    },
    {
      path: '/configuration',
      name: 'Configuration',
      component: () => import('./views/Configuration.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('./views/Login.vue')
    },
    {
      path: '/base/:name',
      name: 'Configuration Model',
      component: () => import('./views/Base.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/noPermissions',
      name: 'noPermissions',
      component: () => import('./views/NoPermissions.vue')
    },
    {
      path: '/changePassword',
      name: 'changePassword',
      component: () => import('./views/ChangePassword.vue')
    },
    {
      path: '/initialize',
      name: 'Initialize',
      component: () => import('./views/Initialize.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/initialize') {
    next()
  } else {
    if (router.app.$store === undefined) {
      next('/login')
    } else if (
      router.app.$store.state.user === null ||
      router.app.$store.state.user === undefined
    ) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
