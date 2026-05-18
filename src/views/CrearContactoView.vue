<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'

const router = useRouter()
const auth = useAuthStore()

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

async function handleCrear() {
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
        formData.append('nombre', nombre.value)
        formData.append('apellido', apellido.value)
        formData.append('telefono', telefono.value)
        formData.append('email', email.value)
        formData.append('direccion', direccion.value)
        formData.append('notas', notas.value)
        if (foto.value) formData.append('foto', foto.value)

        const response = await fetch(`${API_URL}/contactos/crear.php`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token}` },
            body: formData
    
        })

        const texto = await response.text() // ← texto crudo primero
        console.log('respuesta cruda:', texto)
        const data = JSON.parse(texto)      

        if (data.success) {
            exito.value = 'Contacto creado correctamente'
            router.push('/agenda')
        } else {
            error.value = data.message
        }
    } catch (e) {
        console.error(e)
        error.value = 'Error al procesar la respuesta del servidor'
    } finally {
        cargando.value = false
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
