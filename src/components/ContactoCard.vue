<script setup>
import { getApiUrl } from '@/config/api'
import { ref, onMounted } from 'vue'
import '@/assets/contacto-card.css'
const props = defineProps({ contacto: Object })
defineEmits(['eliminar'])

const baseUrl = ref('')
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
            :src="contacto.foto ? `${baseUrl}/${contacto.foto}` : '/default.png'" 
            @error="e => e.target.src='/default.png'" 
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
