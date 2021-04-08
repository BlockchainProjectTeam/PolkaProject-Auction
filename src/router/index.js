import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/detail',
    name: 'Detail',
    component: () => import( '../views/Detail.vue' ),
    props: route => ({
      ID: route.query.ID
    })
  },
  {
    path: '/crowdloan',
    name: 'Crowdloan',
    component: () => import( '../views/Crowdloan.vue' ),
  },
  {
    path: '/submit',
    name: 'Submit',
    component: () => import( '../views/Submit.vue' ),
  },
  {
    path: '*',
    component: () =>import ('../views/404.vue'),
  },
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

export default router
