import{defineStore} from 'pinia'
import {ref} from 'vue'
import {getApiUrl} from '@/config/api'

export const useAuthStore = defineStore('auth', () =>{
    const token = ref(localStorage.getItem('token') || null)
    const usuario =ref(JSON.parse(localStorage.getItem('usuario')) || null )
 
    function guardarSesion(nuevoToken, nuevoUsuario){
        token.value= nuevoToken
        usuario.value= nuevoUsuario
        localStorage.setItem('token', nuevoToken)
        localStorage.setItem('usuario', JSON.stringify(nuevoUsuario))
    }

    function cerrarSesion(){
        token.value=null
        usuario.value=null
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
    }

    async function login(nombre_de_usuario, password){
        const API_URL = await getApiUrl()
        const response = await fetch(`${API_URL}/auth/login.php`,{
            method: 'POST',
            headers:{ 'Content-Type':'application/json'},
            body: JSON.stringify({nombre_de_usuario, password})
        })
        const data = await response.json()
        if(data.success){
            guardarSesion(data.token, data.usuario)
        }
        return data 
    }

    async function logout(){
        const API_URL= await getApiUrl()
        await fetch(`${API_URL}/auth/logout.php`,{
            method: 'POST',
            headers:{Authorization: `Bearer ${token.value}` }
        })
        cerrarSesion()
    }
    return{token, usuario, login, logout, guardarSesion, cerrarSesion}
})