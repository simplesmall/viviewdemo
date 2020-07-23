import Vue from 'vue'
import Router from 'vue-router'
import BUS from '@/components/BUS'
import DrawBoard from "../components/DrawBoard";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'bus',
      component: BUS
    },
    {
      path: '/bus',
      name: 'bus',
      component: BUS
    },
    {
      path: '/draw',
      name:'DrawBoard',
      component: DrawBoard
    },
  ]
})
