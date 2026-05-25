<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'

const router = useRouter()
const auth = useAuthStore() // Trae los datos globales del usuario logueado y su token

// VARIABLES REACTIVAS: Guardan el estado del perfil en la pantalla
const nombre_de_usuario = ref('')
const foto = ref(null)             // Guarda el bloque de bytes si el usuario sube una nueva imagen
const previsualizacion = ref(null) // Guarda la ruta de la foto actual o la miniatura temporal
const fecha_registro = ref('')
const error = ref('')
const exito = ref('')
const cargando = ref(false)        // Controla que el botón se desactive al guardar cambios
const baseUrl = ref('')            // Guarda la URL base del servidor de Alwaysdata

// Captura la nueva imagen elegida en el input file
function seleccionarFoto(e) {
    const archivo = e.target.files[0] // Agarra el archivo binario crudo
    if (!archivo) return
    foto.value = archivo
    // Crea una ruta temporal para previsualizar la foto elegida al instante
    previsualizacion.value = URL.createObjectURL(archivo)
}

// CARGAR PERFIL (READ): Trae la información del usuario logueado
async function cargarPerfil() {
    try {
        const API_URL = await getApiUrl()
        baseUrl.value = API_URL // Almacena la URL base para construir la ruta final de la foto en el HTML
        
        // Petición GET enviando el token en las cabeceras como autorización
        const response = await fetch(`${API_URL}/auth/perfil.php`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        const data = await response.json()
        
        // Llena las variables con la información que tiene la Base de Datos
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

// ACTUALIZAR (UPDATE): Envía el nuevo nombre de usuario o foto a PHP 
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
        
        // FORMDATA: La caja que transporta textos junto con archivos multimedia (bytes de la foto)
        const formData = new FormData()
        formData.append('nombre_de_usuario', nombre_de_usuario.value)
        // Solo añade la foto al paquete si el usuario seleccionó una nueva para cambiarla
        if (foto.value) formData.append('foto', foto.value)

        // Petición HTTP usando la caja FormData 
        const response = await fetch(`${API_URL}/auth/editar.php`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token}` },
            body: formData
        })
        
        // CONTROL DE ERRORES: Lee la respuesta como texto plano antes de convertirla a JSON
        const texto = await response.text()
        console.log('respuesta cruda:', texto)
        const data = JSON.parse(texto)

        if (data.success) {
            exito.value = 'Perfil actualizado correctamente'
            
            // ACTUALIZACIÓN GLOBAL (Pinia): Actualiza los datos en la memoria del Store
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
        cargando.value = false // Libera el botón
    }
}
// CERRAR SESIÓN: Ejecuta el borrado del Store/LocalStorage y manda al Login
async function cerrarSesion() {
    await auth.logout()
    router.push('/login')
}
// CICLO DE VIDA: Carga los datos del perfil de forma automática en cuanto la pantalla se monta
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
