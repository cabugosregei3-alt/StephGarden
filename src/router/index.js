import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

let isRedirecting = false

router.beforeEach(async (to, from) => {
  if (isRedirecting) {
    isRedirecting = false
    return
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.meta.requiresAuth) {
    if (!session) {
      return { path: '/login' }
    }
  } else if (session && (to.path === '/' || to.path === '/login' || to.path === '/signup')) {
    isRedirecting = true
    return { path: '/dashboard' }
  }
})

export default router
