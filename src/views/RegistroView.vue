<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getApiUrl } from '@/config/api'

const router = useRouter()

const nombre_de_usuario = ref('')
const password = ref('')
const confirmar = ref('')
const error = ref('')
const exito = ref('')
const cargando = ref(false)

async function handleRegistro() {
    error.value = ''
    exito.value = ''

    if (!nombre_de_usuario.value || !password.value || !confirmar.value) {
        error.value = 'Todos los campos son obligatorios'
        return
    }

    if (password.value !== confirmar.value) {
        error.value = 'Las contraseñas no coinciden'
        return
    }

    if (password.value.length < 6) {
        error.value = 'La contraseña debe tener al menos 6 caracteres'
        return
    }

    cargando.value = true
    try {
        const API_URL = await getApiUrl()
        const response = await fetch(`${API_URL}/auth/registrar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre_de_usuario: nombre_de_usuario.value,
                password: password.value
            })
        })
        const data = await response.json()

        if (data.success) {
            exito.value = 'Usuario registrado. Redirigiendo...'
            setTimeout(() => router.push('/login'), 1500)
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
            <h2>Crear cuenta</h2>

            <div v-if="error" class="mensaje-error">{{ error }}</div>
            <div v-if="exito" class="mensaje-exito">{{ exito }}</div>

            <div class="campo">
                <label>Usuario</label>
                <input v-model="nombre_de_usuario" type="text" placeholder="Elige un nombre de usuario" />
            </div>

            <div class="campo">
                <label>Contraseña</label>
                <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" />
            </div>

            <div class="campo">
                <label>Confirmar contraseña</label>
                <input v-model="confirmar" type="password" placeholder="Repite tu contraseña" @keyup.enter="handleRegistro" />
            </div>

            <button @click="handleRegistro" :disabled="cargando">
                {{ cargando ? 'Registrando...' : 'Registrarse' }}
            </button>

            <p class="link">¿Ya tienes cuenta? <a @click="$router.push('/login')">Inicia sesión</a></p>
        </div>
    </div>
</template>
