<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getApiUrl } from '@/config/api'

const router = useRouter() 

// VARIABLES REACTIVAS: Guardan lo que el usuario escribe en las cajas de texto
const nombre_de_usuario = ref('')
const password = ref('')
const confirmar = ref('')
const error = ref('')
const exito = ref('')
const cargando = ref(false) // Desactiva el botón mientras el servidor procesa el registro

//Valida las reglas  y envía los datos
async function handleRegistro() {
    error.value = '' // Limpia errores anteriores
    exito.value = '' // Limpia mensajes de éxito anteriores

    // 1. VALIDACIÓN LOCAL 1: Revisa que ningún campo esté vacío
    if (!nombre_de_usuario.value || !password.value || !confirmar.value) {
        error.value = 'Todos los campos son obligatorios'
        return
    }

    // 2. VALIDACIÓN LOCAL 2: Verifica que las dos contraseñas escritas sean idénticas
    if (password.value !== confirmar.value) {
        error.value = 'Las contraseñas no coinciden'
        return
    }

    // 3. VALIDACIÓN LOCAL 3: Filtra que la contraseña cumpla con una longitud mínima de seguridad
    if (password.value.length < 6) {
        error.value = 'La contraseña debe tener al menos 6 caracteres'
        return
    }

    cargando.value = true // Activa el estado de carga (bloquea el botón)
    try {
        const API_URL = await getApiUrl() // Consigue la URL de Alwaysdata
        
        // Envía los datos empaquetados en texto plano
        // olo enviamos 'nombre_de_usuario' y 'password'
        const response = await fetch(`${API_URL}/auth/registrar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Avisa que lleva texto tipo JSON
            body: JSON.stringify({
                nombre_de_usuario: nombre_de_usuario.value,
                password: password.value
            })
        })
        const data = await response.json() // Lee la respuesta del servidor PHP

        // CONTROL DE ÉXITO: Si PHP pudo insertar el nuevo registro en MySQL con éxito
        if (data.success) {
            exito.value = 'Usuario registrado. Redirigiendo...'
            // setTimeout: Espera 1.5 segundos (1500ms) para que el usuario alcance a leer el mensaje de éxito antes de mandarlo al Login
            setTimeout(() => router.push('/login'), 1500)
        } else {
            error.value = data.message // Muestra el error de PHP (ej. "El usuario ya existe")
        }
    } catch (e) {
        error.value = 'Error de conexión con el servidor' // Captura si el servidor web está caído
    } finally {
        cargando.value = false // Libera el botón si hubo un error
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
                <label for="username">Usuario</label>
                <input id="username" v-model="nombre_de_usuario" type="text" placeholder="Elige un nombre de usuario" />
            </div>

            <div class="campo">
                <label for="pwd">Contraseña</label>
                <input id="pwd" v-model="password" type="password" placeholder="Mínimo 6 caracteres" />
            </div>

            <div class="campo">
                <label for="confirm_pwd">Confirmar contraseña</label>
                <input id="confirm_pwd" v-model="confirmar" type="password" placeholder="Repite tu contraseña" @keyup.enter="handleRegistro" />
            </div>

            <button @click="handleRegistro" :disabled="cargando">
                {{ cargando ? 'Registrando...' : 'Registrarse' }}
            </button>

            <p class="link">¿Ya tienes cuenta? <a @click="$router.push('/login')">Inicia sesión</a></p>
        </div>
    </div>
</template>