<script setup>
import { getApiUrl } from '@/config/api'
import { ref, onMounted, computed } from 'vue' // <-- 1. Importamos computed aquí
import '@/assets/contacto-card.css'

const props = defineProps({ contacto: Object })
defineEmits(['eliminar'])

const baseUrl = ref('') 

onMounted(async () => {
    const url = await getApiUrl()
    baseUrl.value = url
})

// 2. Creamos la propiedad computada inteligente fuera de onMounted
const urlImagen = computed(() => {
    // Si no hay foto, silueta por defecto
    if (!props.contacto.foto) {
        return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    }

    // Si ya viene con http o https, la dejamos igual
    if (props.contacto.foto.startsWith('http://') || props.contacto.foto.startsWith('https://')) {
        return props.contacto.foto
    }

    // Si solo viene "default.png" o similar, construimos la ruta bien armada
    const servidorBase = baseUrl.value.replace('/api', '').replace(/\/+$/, '') 
    let rutaFoto = props.contacto.foto.replace(/^\/+/, '')
    
    if (!rutaFoto.includes('uploads/')) {
        rutaFoto = `uploads/contactos/${rutaFoto}`
    }

    return `${servidorBase}/${rutaFoto}` 
})
</script>

<template>
    <div class="card">
        <img 
            :src="urlImagen" 
            @error="e => e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" 
            alt="Foto de contacto"
        />
        
        <div class="info">
            <h3>{{ contacto.nombre }} {{ contacto.apellido }}</h3>
            <p>📞 {{ contacto.telefono }}</p>
            <p v-if="contacto.email">✉️ {{ contacto.email }}</p>
        </div>
        <div class="acciones">
            <router-link :to="`/agenda/${contacto.id}`">✏️ Editar</router-link>
            <button @click="$emit('eliminar', contacto.id)">🗑️ Eliminar</button>
        </div>
    </div>
</template>