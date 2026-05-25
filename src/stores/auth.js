import{defineStore} from 'pinia'
import {ref} from 'vue'
import {getApiUrl} from '@/config/api'


// Este store maneja la autenticación del usuario, incluyendo el token y la información del usuario.
export const useAuthStore = defineStore('auth', () =>{
    const token = ref(localStorage.getItem('token') || null)//lee el token del localStorage o lo inicializa como null si no existe
    const usuario =ref(JSON.parse(localStorage.getItem('usuario')) || null )
 
    function guardarSesion(nuevoToken, nuevoUsuario){//guarda los datos si el login es exitoso
        token.value= nuevoToken
        usuario.value= nuevoUsuario
        localStorage.setItem('token', nuevoToken)//se guarda local para que no se pierda al recargar la página
        localStorage.setItem('usuario', JSON.stringify(nuevoUsuario))
    }

    function cerrarSesion(){//limpia los datos de la sesión
        token.value=null
        usuario.value=null
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
    }

    async function login(nombre_de_usuario, password){//realiza la peticion para entrar al sistema
        const API_URL = await getApiUrl()//se obtiene la URL de la API desde la configuración
        const response = await fetch(`${API_URL}/auth/login.php`,{
            method: 'POST',
            headers:{ 'Content-Type':'application/json'},
            body: JSON.stringify({nombre_de_usuario, password})
        })
        const data = await response.json()
        if(data.success){//si son ccorrectos se guardan
            guardarSesion(data.token, data.usuario)
        }
        return data 
    }

    async function logout(){//realiza la petición para cerrar sesión en el servidor
        const API_URL= await getApiUrl()
        await fetch(`${API_URL}/auth/logout.php`,{//se hace la petición para cerrar sesión en el servidor
            method: 'POST',
            headers:{Authorization: `Bearer ${token.value}` }
        })
        cerrarSesion()
    }
    return{token, usuario, login, logout, guardarSesion, cerrarSesion}//se exportan las variables y funciones para que puedan ser utilizadas en otros componentes
})
