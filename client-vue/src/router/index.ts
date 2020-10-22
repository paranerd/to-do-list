import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import AccessManagement from '@/views/AccessManagement.vue';
import AuthService from '@/services/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
        requiresAuth: true
    }
  },
  {
    path: '/access-management',
    name: 'access-management',
    component: AccessManagement,
    meta: {
        requiresAuth: true
    }
    // route level code-splitting
    // this generates a separate chunk (access-management.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: () => import(/* webpackChunkName: "access-management" */ '../views/AccessManagement.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
    // Need to login
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const auth = new AuthService();

        if (!auth.isLoggedIn()) {
            next({
                name: 'login'
            });
        }
        else {
            next();
        }
    }
    else {
        next();
    }
})

export default router
