<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'
import ContactoCard from '@/components/ContactoCard.vue'// trae el componente ContactoCard para mostrar cada contacto en la lista

const router = useRouter()
const auth = useAuthStore()//accede al store de autenticación para obtener el token y manejar el logout

const contactos = ref([]) // almacena la lista de contactos obtenida del backend
const error = ref('') // almacena cualquier mensaje de error que ocurra durante la carga o eliminación de contactos
const cargando = ref(true) //controla si se muestra el textod de "cargando..."
const busqueda = ref('') // guarda el texto que se usa para buscar

async function cargarContactos() {
    try {
        const API_URL = await getApiUrl()// obtiene la URL base de la API desde la configuración
        const response = await fetch(`${API_URL}/contactos/index.php`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        const data = await response.json()
        if (Array.isArray(data)) {// si la respuesta indica éxito, se asigna la lista de contactos al estado
            contactos.value = data
        } else if(data && (data.success == true || data.success == "true")){
            contactos.value = data.contactos || data.contact || data.data || data.lista || []
        }else{
            error.value = data.message || 'Error al cargar contactos'
        }
    }catch(e){
        error.value = "Error al cargar contactos"
    } finally{
        cargando.value = false
    }
}

async function eliminarContacto(id) {   // pregunta al usuario si está seguro de eliminar el contacto
    if (!confirm('¿Seguro que quieres eliminar este contacto?')) return

    try {
        const API_URL = await getApiUrl()
        const response = await fetch(`${API_URL}/contactos/eliminar.php`, {// realiza una solicitud POST al backend para eliminar el contacto con el ID especificado
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

async function cerrarSesion() {// llama al método de logout del store de autenticación para limpiar el token y redirige al login
    await auth.logout()
    router.push('/login')
}

const contactosFiltrados = () => {// devuelve la lista de contactos filtrada según el texto de búsqueda ingresado por el usuario
    if (!busqueda.value) return contactos.value
    const b = busqueda.value.toLowerCase()
    return contactos.value.filter(c =>
        c.nombre.toLowerCase().includes(b) ||
        (c.apellido && c.apellido.toLowerCase().includes(b)) ||
        c.telefono.includes(b)
    )
}

onMounted(cargarContactos)// cuando el componente se monta, se llama a la función cargarContactos para obtener la lista de contactos del backend
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
