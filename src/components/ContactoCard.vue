<script setup>
import { getApiUrl } from '@/config/api'// carga la función para obtener la URL de la API
import { ref, onMounted } from 'vue'
import '@/assets/contacto-card.css'
const props = defineProps({ contacto: Object })
defineEmits(['eliminar']) //declara el evento personalizado 'eliminar' que se emitirá al hacer clic en el botón de eliminar

const baseUrl = ref('') // almacena la URL base de la API
onMounted(async () => {
    const url = await getApiUrl()
    baseUrl.value = url
    console.log('Base URL:', baseUrl.value)
    console.log('foto contacto:',props.contacto.foto)
    console.log('URL final:', `${baseUrl.value}/${props.contacto.foto}`)
})
</script>

<template>
    <div class="card">
        <img 
            :src="contacto.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" 
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