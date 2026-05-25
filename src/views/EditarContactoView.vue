<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'

const router = useRouter()
const route = useRoute()     // useRoute: Sirve para leer los parámetros que vienen arriba en la URL
const auth = useAuthStore()   // Trae el token para identificarse con el servidor PHP

// ID DEL CONTACTO: Recupera el ID de la URL (ejemplo: si es /agenda/5, id vale 5)
const id = route.params.id

// VARIABLES REACTIVAS: Guardan los datos que se van a editar en el formulario
const nombre = ref('')
const apellido = ref('')
const telefono = ref('')
const email = ref('')
const direccion = ref('')
const notas = ref('')
const foto = ref(null)             // Guarda el bloque de bytes si el usuario elige una foto nueva
const previsualizacion = ref(null) // Guarda la imagen actual o la nueva miniatura temporal
const error = ref('')
const exito = ref('')
const cargando = ref(false)        // Controla que el botón se desactive al guardar

// SELECCIONAR FOTO: Captura la nueva imagen si el usuario decide cambiarla
function seleccionarFoto(e) {
    const archivo = e.target.files[0] // Agarra el archivo binario crudo
    if (!archivo) return
    foto.value = archivo
    // URL.createObjectURL: Muestra la vista previa instantánea en la pantalla
    previsualizacion.value = URL.createObjectURL(archivo)
}

// DETALLE (READ): Trae los datos actuales del contacto para rellenar el formulario (Método GET)
async function cargarContacto() {
    try {
        const API_URL = await getApiUrl()
        
        // Petición GET mandando el ID en la URL y el token en la cabecera
        const response = await fetch(`${API_URL}/contactos/detalle.php?id=${id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        const data = await response.json()
        
        // HIDRATACIÓN DE DATOS: Rellena los inputs con lo que tiene guardado la base de datos
        if (data.success) {
            const c = data.contacto
            nombre.value = c.nombre
            apellido.value = c.apellido || ''
            telefono.value = c.telefono
            email.value = c.email || ''
            direccion.value = c.direccion || ''
            notas.value = c.notas || ''
            previsualizacion.value = c.foto || null // Si tiene foto, guarda su ruta
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error al cargar el contacto'
    }
}

// UPDATE (Actualizar): Envía los cambios al backend (Método POST con FormData)
async function handleActualizar() {
    error.value = ''
    exito.value = ''

    // Validación básica en el cliente
    if (!nombre.value || !telefono.value) {
        error.value = 'Nombre y teléfono son obligatorios'
        return
    }

    cargando.value = true
    try {
        const API_URL = await getApiUrl()
        
        // FORMDATA: La caja multimedia que mezcla los textos editados con la imagen nueva
        const formData = new FormData()
        formData.append('id', id) // Envía el ID para saber qué fila de MySQL modificar
        formData.append('nombre', nombre.value)
        formData.append('apellido', apellido.value)
        formData.append('telefono', telefono.value)
        formData.append('email', email.value)
        formData.append('direccion', direccion.value)
        formData.append('notas', notas.value)
        // Solo anexa la foto al paquete si el usuario seleccionó una nueva
        if (foto.value) formData.append('foto', foto.value)

        // Petición HTTP hacia el archivo actualizar.php
        const response = await fetch(`${API_URL}/contactos/actualizar.php`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token}` }, // Cabecera Content-Type vacía para el boundary
            body: formData
        })
        
        // CONTROL DE ERRORES: Lee la respuesta en texto plano antes por seguridad
        const texto = await response.text()
        console.log('respuesta cruda:', texto)
        const data = JSON.parse(texto) // Lo convierte a objeto JSON

        if (data.success) {
            exito.value = 'Contacto actualizado. Redirigiendo...'
            router.push('/agenda') // Si fue exitoso, regresa al usuario a la lista
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error de conexión'
    } finally {
        cargando.value = false // Libera el botón
    }
}

// CICLO DE VIDA: En cuanto la pantalla se monta, va a la base de datos por la información actual
onMounted(cargarContacto)
</script>

<template>
    <div class="form-container">
        <div class="form-card">
            <div class="form-header">
                <button class="btn-volver" @click="$router.push('/agenda')">← Volver</button>
                <h2>Editar Contacto</h2>
            </div>

            <div v-if="error" class="mensaje-error">{{ error }}</div>
            <div v-if="exito" class="mensaje-exito">{{ exito }}</div>

            <div class="foto-campo">
                <img :src="previsualizacion || '/default.png'" class="foto-preview" />
                <label class="btn-foto">
                    📷 Cambiar foto
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

            <button @click="handleActualizar" :disabled="cargando" class="btn-guardar">
                {{ cargando ? 'Guardando...' : 'Actualizar Contacto' }}
            </button>
        </div>
    </div>
</template>
