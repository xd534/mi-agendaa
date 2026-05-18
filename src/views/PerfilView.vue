<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'

const router = useRouter()
const auth = useAuthStore()

const nombre_de_usuario = ref('')
const foto = ref(null)
const previsualizacion = ref(null)
const fecha_registro = ref('')
const error = ref('')
const exito = ref('')
const cargando = ref(false)
const baseUrl = ref('')  // ← faltaba esto

function seleccionarFoto(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    foto.value = archivo
    previsualizacion.value = URL.createObjectURL(archivo)
}

async function cargarPerfil() {
    try {
        const API_URL = await getApiUrl()
        baseUrl.value = API_URL
        const response = await fetch(`${API_URL}/auth/perfil.php`, {  // ← auth no usuarios
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        const data = await response.json()
        if (data.success) {
            nombre_de_usuario.value = data.usuario.nombre_de_usuario
            previsualizacion.value = data.usuario.foto || null
            fecha_registro.value = data.usuario.fecha_registro
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error al cargar el perfil'
    }
}

async function handleActualizar() {
    error.value = ''
    exito.value = ''

    if (!nombre_de_usuario.value) {
        error.value = 'El nombre de usuario es obligatorio'
        return
    }

    cargando.value = true
    try {
        const API_URL = await getApiUrl()
        const formData = new FormData()
        formData.append('nombre_de_usuario', nombre_de_usuario.value)
        if (foto.value) formData.append('foto', foto.value)

        const response = await fetch(`${API_URL}/auth/editar.php`, {  // ← auth no usuarios
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token}` },
            body: formData
        })
        const texto = await response.text()
        console.log('respuesta cruda:', texto)
        const data = JSON.parse(texto)

        if (data.success) {
            exito.value = 'Perfil actualizado correctamente'
            auth.guardarSesion(auth.token, {
                ...auth.usuario,
                nombre_de_usuario: nombre_de_usuario.value
            })
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error de conexión'
    } finally {
        cargando.value = false
    }
}

async function cerrarSesion() {
    await auth.logout()
    router.push('/login')
}

onMounted(cargarPerfil)
</script>

<template>
    <div class="perfil-container">
        <div class="perfil-card">
            <div class="form-header">
                <button class="btn-volver" @click="$router.push('/agenda')">← Volver</button>
                <h2>Mi Perfil</h2>
            </div>

            <div v-if="error" class="mensaje-error">{{ error }}</div>
            <div v-if="exito" class="mensaje-exito">{{ exito }}</div>

            <div class="foto-campo">
                <img 
                    :src="previsualizacion && previsualizacion.startsWith('uploads') 
                        ? `${baseUrl}/${previsualizacion}` 
                        : previsualizacion || '/default.png'"
                    class="foto-preview"
                />
                <div>
                    <label class="btn-foto">
                        📷 Cambiar foto
                        <input type="file" accept="image/*" @change="seleccionarFoto" hidden />
                    </label>
                    <p class="fecha" v-if="fecha_registro">
                        Miembro desde {{ new Date(fecha_registro).toLocaleDateString() }}
                    </p>
                </div>
            </div>

            <div class="campo">
                <label>Nombre de usuario</label>
                <input v-model="nombre_de_usuario" type="text" placeholder="Tu nombre de usuario" />
            </div>

            <button @click="handleActualizar" :disabled="cargando" class="btn-guardar">
                {{ cargando ? 'Guardando...' : 'Actualizar Perfil' }}
            </button>

            <button @click="cerrarSesion" class="btn-logout">
                🚪 Cerrar sesión
            </button>
        </div>
    </div>
</template>
