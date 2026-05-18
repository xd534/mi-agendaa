<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const nombre_de_usuario = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)

async function handleLogin() {
    error.value = ''

    if (!nombre_de_usuario.value || !password.value) {
        error.value = 'Todos los campos son obligatorios'
        return
    }

    cargando.value = true
    try {
        const data = await auth.login(nombre_de_usuario.value, password.value)
        if (data.success) {
            router.push('/agenda')
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error de conexión con el servidor'
    } finally {
        cargando.value = false
    }
}
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <h1>Mi Agenda</h1>
            <h2>Iniciar Sesión</h2>

            <div v-if="error" class="mensaje-error">{{ error }}</div>

            <div class="campo">
                <label>Usuario</label>
                <input v-model="nombre_de_usuario" type="text" placeholder="Tu nombre de usuario" />
            </div>

            <div class="campo">
                <label>Contraseña</label>
                <input v-model="password" type="password" placeholder="Tu contraseña" @keyup.enter="handleLogin" />
            </div>

            <button @click="handleLogin" :disabled="cargando">
                {{ cargando ? 'Entrando...' : 'Entrar' }}
            </button>

            <p class="link">¿No tienes cuenta? <a @click="$router.push('/registro')">Regístrate</a></p>
        </div>
    </div>
</template>
