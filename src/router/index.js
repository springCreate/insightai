import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EvidenceView from '../views/EvidenceView.vue'
import ResultsView from '../views/ResultsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/results',
      name: 'results',
      component: ResultsView
    },
    {
      path: '/evidence',
      name: 'evidence',
      component: EvidenceView
    }
  ]
})

export default router
