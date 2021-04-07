import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: () => import(/* webpackChunkName: "recommend" */ '@/views/Recommend/index.vue'),
    children: [{
      path: ':id',
      name: 'recommend-detail',
      component: () => import(/* webpackChunkName: "recommend-detail" */ 'components/recommend-detail/index'),
    }]
  },
  {
    path: '/singer',
    name: 'singer',
    component: () => import(/* webpackChunkName: "singer" */ '@/views/Singer/index'),
    children: [{
      path: ':id',
      name: 'singer-detail',
      component: () => import(/* webpackChunkName: "singer-detail" */ 'components/singer-detail/index'),
    }]
  },
  {
    path: '/rank',
    name: 'rank',
    component: () => import(/* webpackChunkName: "rank" */ '@/views/Rank/index.vue'),
    children: [{
      path: ':id',
      name: 'rank-detail',
      component: () => import(/* webpackChunkName: "rank-detail" */ 'components/top-list/index'),
    }]
  },
  {
    path: '/search',
    name: 'search',
    component: () => import(/* webpackChunkName: "search" */ '@/views/Search/index.vue'),
    children: [{
      path: ':id',
      name: 'search-detail',
      component: () => import(/* webpackChunkName: "search-detail" */ 'components/search-detail/index'),
    }]
  },
  {
    path: '/user',
    name: 'user',
    component: () => import(/* webpackChunkName: "user" */ '@/views/User/index.vue')
  },
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
