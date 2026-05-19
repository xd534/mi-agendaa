import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {path: '/',         component:()=> import('@/views/HomeView.vue')},
  {path: '/login',    component:()=> import('@/views/LoginView.vue')},
  {path: '/registro', component:()=> import('@/views/RegistroView.vue')},
  {path: '/agenda',   component:()=> import('@/views/AgendaView.vue') , meta:{requiresAuth:true}},
  {path: '/agenda/crear', component:()=> import('@/views/CrearContactoView.vue'), meta:{requiresAuth:true}},
  {path: '/agenda/:id', component:()=> import('@/views/EditarContactoView.vue'), meta:{requiresAuth:true}},  
  {path: '/perfil', component:()=> import('@/views/PerfilView.vue'), meta:{requiresAuth:true}},  
]

const router = createRouter({
  history:createWebHashHistory(),
  routes
})

router.beforeEach((to) =>{
  const auth = useAuthStore()
  if(to.meta.requiresAuth && !auth.token){
    return '/login'
  }
})

export default router