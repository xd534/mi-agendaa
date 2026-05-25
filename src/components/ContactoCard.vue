<script setup>
import { getApiUrl } from '@/config/api'
import { ref, onMounted, computed } from 'vue'
import '@/assets/contacto-card.css'

const props = defineProps({ contacto: Object })
defineEmits(['eliminar'])

const baseUrl = ref('') 

onMounted(async () => {
    const url = await getApiUrl()
    baseUrl.value = url
})

const urlImagen = computed(() => {
    const siluetaDefault = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

    // Si el contacto no existe o no tiene una propiedad foto válida, silueta
    if (!props.contacto || !props.contacto.foto) {
        return siluetaDefault
    }

    const fotoStr = props.contacto.foto.toString().trim()

    // EVALUACIÓN ULTRA-ESTRICTA: ¿Es verdaderamente el archivo por defecto?
    if (fotoStr === '' || fotoStr === 'default.png' || fotoStr.endsWith('/default.png')) {
        return siluetaDefault
    }

    // Si ya viene con http o https completa (por si acaso)
    if (fotoStr.startsWith('http://') || fotoStr.startsWith('https://')) {
        return fotoStr
    }

    // Asegurar el dominio base limpio de Alwaysdata sin importar el config.json
    const servidorAlwaysdata = 'https://fullagenda.alwaysdata.net'
    
    // Limpiamos barras inclinadas extras al inicio
    let rutaFoto = fotoStr.replace(/^\/+/, '')
    
    // Si la base de datos no guardó el prefijo 'uploads/', se lo ponemos
    if (!rutaFoto.startsWith('uploads/')) {
        rutaFoto = `uploads/contactos/${rutaFoto}`
    }

    // Retornamos la ruta final absoluta hacia Alwaysdata
    return `${servidorAlwaysdata}/${rutaFoto}` 
})
</script>

<template>
    <div class="card">
        <img 
            :src="urlImagen" 
            @error="e => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }" 
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