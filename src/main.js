import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import LoginView from './views/LoginView.vue'
import OrderStatusView from './views/OrderStatusView.vue'
import NotFoundView from './views/NotFoundView.vue'
import HomeView from './views/HomeView.vue'
import './style.css'

const companyId = import.meta.env.VITE_COMPANY_ID

const routes = [
  {
    path: '/',
    name: 'home',
    ...(companyId
      ? { redirect: `/c${companyId}/status` }
      : { component: HomeView })
  },
  {
    path: '/c:companyId/status',
    name: 'order-status-login',
    component: LoginView
  },
  {
    path: '/c:companyId/status/:id',
    name: 'order-status-overview',
    component: OrderStatusView
  },
  {
    path: '/c:companyId',
    redirect: to => ({
      name: 'order-status-login',
      params: {
        companyId: to.params.companyId
      }
    })
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App)
  .use(router)
  .mount('#app')
