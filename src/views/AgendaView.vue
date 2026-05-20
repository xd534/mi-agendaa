<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'
import ContactoCard from '@/components/ContactoCard.vue'

const router = useRouter()
const auth = useAuthStore()

const contactos = ref([])
const error = ref('')
const cargando = ref(true)
const busqueda = ref('')

async function cargarContactos() {
    try {
        const API_URL = await getApiUrl()
        const response = await fetch(`${API_URL}/contactos/index.php`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        const data = await response.json()
        if (data.success) {
            contactos.value = data.contactos
        } else {
            error.value = data.message
        }
    } catch (e) {
        error.value = 'Error de conexión'
    } finally {
        cargando.value = false
    }
}

async function eliminarContacto(id) {
    if (!confirm('¿Seguro que quieres eliminar este contacto?')) return

    try {
        const API_URL = await getApiUrl()
        const response = await fetch(`${API_URL}/contactos/eliminar.php`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
        const data = await response.json()
        if (data.success) {
            contactos.value = contactos.value.filter(c => c.id !== id)
        } else {
            alert(data.message)
        }
    } catch (e) {
        alert('Error al eliminar')
    }
}

async function cerrarSesion() {
    await auth.logout()
    router.push('/login')
}

const contactosFiltrados = () => {
    if (!busqueda.value) return contactos.value
    const b = busqueda.value.toLowerCase()
    return contactos.value.filter(c =>
        c.nombre.toLowerCase().includes(b) ||
        (c.apellido && c.apellido.toLowerCase().includes(b)) ||
        c.telefono.includes(b)
    )
}

onMounted(cargarContactos)
</script>

<template>
    <div class="agenda-container">
        <header>
            <h1>📒 Mi Agenda</h1>
            <div class="header-acciones">
                <router-link to="/perfil" class="btn-secundario">👤 Perfil</router-link>
                <button @click="cerrarSesion" class="btn-logout">Salir</button>
            </div>
        </header>

        <div class="barra-acciones">
            <input v-model="busqueda" type="text" placeholder="🔍 Buscar contacto..." />
            <router-link to="/agenda/crear" class="btn-primario">+ Nuevo</router-link>
        </div>

        <div v-if="cargando" class="estado">Cargando contactos...</div>
        <div v-else-if="error" class="mensaje-error">{{ error }}</div>
        <div v-else-if="contactosFiltrados().length === 0" class="estado">
            No hay contactos aún.
        </div>

        <div v-else class="lista">
            <ContactoCard
                v-for="contacto in contactosFiltrados()"
                :key="contacto.id"
                :contacto="contacto"
                @eliminar="eliminarContacto"
            />
        </div>
    </div>
</template>
