<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore() //revisa si el usuario ya tiene un token, si es así lo redirige a la agenda, sino lo redirige al login

function continuar() {
    if (auth.token) {// si existe un token, redirige a la agenda
        router.push('/agenda')
    } else {// si no existe un token, redirige al login
        router.push('/login')
    }
}
</script>

<template>
    <div class="home-container">
        <div class="home-content">
            <div class="icono">📒</div>
            <h1>Mi Agenda</h1>
            <p>Guarda y organiza tus contactos de forma sencilla y segura.</p>
            <button @click="continuar">Comenzar</button>
        </div>
    </div>
</template>

