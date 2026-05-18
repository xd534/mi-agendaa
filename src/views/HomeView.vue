<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function continuar() {
    if (auth.token) {
        router.push('/agenda')
    } else {
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

