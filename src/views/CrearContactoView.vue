<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'

const router = useRouter()
const auth = useAuthStore() // Trae el token para identificarse con el servidor PHP

// VARIABLES REACTIVAS: Guardan los datos escritos en el formulario
const nombre = ref('')
const apellido = ref('')
const telefono = ref('')
const email = ref('')
const direccion = ref('')
const notas = ref('')
const foto = ref(null)             // Guarda el bloque de bytes de la imagen real
const previsualizacion = ref(null) // Guarda una URL temporal para ver la foto en pantalla
const error = ref('')
const exito = ref('')
const cargando = ref(false)        // Desactiva el botón mientras viajan los datos

// SELECCIONAR FOTO: Captura la imagen elegida por el usuario
function seleccionarFoto(e) {
    const archivo = e.target.files[0] // Agarra el archivo binario crudo
    if (!archivo) return
    foto.value = archivo
    // URL.createObjectURL: Crea un enlace temporal en memoria para mostrar la miniatura en la vista
    previsualizacion.value = URL.createObjectURL(archivo)
}

// CREATE: Envía el formulario al backend (Método POST con FormData)
async function handleCrear() {
    error.value = ''
    exito.value = ''

    // Validación local básica en el cliente
    if (!nombre.value || !telefono.value) {
        error.value = 'Nombre y teléfono son obligatorios'
        return
    }

    cargando.value = true
    try {
        const API_URL = await getApiUrl()
        
        // FORMDATA: La "caja especial" que permite mezclar textos comunes con archivos binarios (la foto)
        const formData = new FormData()
        formData.append('nombre', nombre.value)
        formData.append('apellido', apellido.value)
        formData.append('telefono', telefono.value)
        formData.append('email', email.value)
        formData.append('direccion', direccion.value)
        formData.append('notas', notas.value)
        // Si el usuario eligió una foto, la mete a la caja
        if (foto.value) formData.append('foto', foto.value)

        // Petición HTTP usando la caja FormData
        const response = await fetch(`${API_URL}/contactos/crear.php`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token}` }, // Envía el token (cabecera vacía de Content-Type para el boundary)
            body: formData
        })
        // Sirve para depurar en consola si PHP manda algún texto raro, un error o una advertencia extraña
        const texto = await response.text() 
        console.log('respuesta cruda:', texto)
        const data = JSON.parse(texto) // Ahora sí lo convierte en objeto manipulable     

        if (data.success) {
            exito.value = 'Contacto creado correctamente'
            router.push('/agenda') // Si todo salió bien, nos regresa a la lista principal
        } else {
            error.value = data.message
        }
    } catch (e) {
        console.error(e)
        error.value = 'Error al procesar la respuesta del servidor'
    } finally {
        cargando.value = false // Libera el botón para un nuevo intento
    }
}
</script>

<template>
    <div class="form-container">
        <div class="form-card">
            <div class="form-header">
                <button class="btn-volver" @click="$router.push('/agenda')">← Volver</button>
                <h2>Nuevo Contacto</h2>
            </div>

            <div v-if="error" class="mensaje-error">{{ error }}</div>
            <div v-if="exito" class="mensaje-exito">{{ exito }}</div>

            <!-- Foto -->
            <div class="foto-campo">
                <img :src="previsualizacion || '/default.png'" class="foto-preview" />
                <label class="btn-foto">
                    📷 Elegir foto
                    <input type="file" accept="image/*" @change="seleccionarFoto" hidden />
                </label>
            </div>

            <div class="campo">
                <label>Nombre *</label>
                <input v-model="nombre" type="text" placeholder="Nombre del contacto" />
            </div>

            <div class="campo">
                <label>Apellido</label>
                <input v-model="apellido" type="text" placeholder="Apellido" />
            </div>

            <div class="campo">
                <label>Teléfono *</label>
                <input v-model="telefono" type="tel" placeholder="Número de teléfono" />
            </div>

            <div class="campo">
                <label>Email</label>
                <input v-model="email" type="email" placeholder="correo@ejemplo.com" />
            </div>

            <div class="campo">
                <label>Dirección</label>
                <input v-model="direccion" type="text" placeholder="Dirección" />
            </div>

            <div class="campo">
                <label>Notas</label>
                <textarea v-model="notas" placeholder="Notas adicionales..." rows="3"></textarea>
            </div>

            <button @click="handleCrear" :disabled="cargando" class="btn-guardar">
                {{ cargando ? 'Guardando...' : 'Guardar Contacto' }}
            </button>
        </div>
    </div>
</template>
