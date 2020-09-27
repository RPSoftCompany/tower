import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/timearchive',
      name: 'Time Archive',
      component: () => import('./views/TimeArchive.vue'),
    },
    {
      path: '/archive',
      name: 'Version Archive',
      component: () => import('./views/Archive.vue'),
    },
    {
      path: '/configuration',
      name: 'Configuration',
      component: () => import('./views/Configuration.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('./views/Login.vue'),
    },
    {
      path: '/base/:name',
      name: 'Base',
      component: () => import('./views/Base.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./views/Settings.vue'),
    },
    {
      path: '/noPermissions',
      name: 'noPermissions',
      component: () => import('./views/NoPermissions.vue'),
    },
    {
      path: '/changePassword',
      name: 'changePassword',
      component: () => import('./views/ChangePassword.vue'),
    },
    {
      path: '/initialize',
      name: 'Initilize',
      component: () => import('./views/Initialize.vue'),
    },
  ],
})

router.beforeEach((to, _from, next) => {
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
