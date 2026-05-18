<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const id = route.params.id
const nombre = ref('')
const apellido = ref('')
const telefono = ref('')
const email = ref('')
const direccion = ref('')
const notas = ref('')
const foto = ref(null)
const previsualizacion = ref(null)
const error = ref('')
const exito = ref('')
const cargando = ref(false)

function seleccionarFoto(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    foto.value = archivo
    previsualizacion.value = URL.createObjectURL(archivo)
}

async function cargarContacto() {
    try {
        const API_URL = await getApiUrl()
        const response = await fetch(`${API_URL}/contactos/detalle.php?id=${id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        const data = await response.json()
        if (data.success) {
            const c = data.contacto
            nombre.value = c.nombre
            apellido.value = c.apellido || ''
            telefono.value = c.telefono
            email.value = c.email || ''
            direccion.value = c.direccion || ''
            notas.value = c.notas || ''
            previsualizacion.value = c.foto || null
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error al cargar el contacto'
    }
}

async function handleActualizar() {
    error.value = ''
    exito.value = ''

    if (!nombre.value || !telefono.value) {
        error.value = 'Nombre y teléfono son obligatorios'
        return
    }

    cargando.value = true
    try {
        const API_URL = await getApiUrl()
        const formData = new FormData()
        formData.append('id', id)
        formData.append('nombre', nombre.value)
        formData.append('apellido', apellido.value)
        formData.append('telefono', telefono.value)
        formData.append('email', email.value)
        formData.append('direccion', direccion.value)
        formData.append('notas', notas.value)
        if (foto.value) formData.append('foto', foto.value)

        const response = await fetch(`${API_URL}/contactos/actualizar.php`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token}` },
            body: formData
        })
        const texto = await response.text()
        console.log('respuesta cruda:', texto)
        const data = JSON.parse.apply(texto)

        if (data.success) {
            exito.value = 'Contacto actualizado. Redirigiendo...'
            router.push('/agenda')
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error de conexión'
    } finally {
        cargando.value = false
    }
}

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
