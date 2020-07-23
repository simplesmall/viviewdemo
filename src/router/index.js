import Vue from 'vue'
import Router from 'vue-router'
import BUS from '@/components/BUS'
import DrawBoard from "../components/DrawBoard";
import XTest from "../components/XTest";
import Main from "../views/Main";

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
    {
      path: '/vuex',
      name:'XTest',
      component: XTest
    },
    {
      path: '/main',
      name: 'Main',
      component: Main
    }
  ]
})
