import router from '@/router'
import axios from 'axios'

const baseURL = import.meta.env.MODE === 'development' ? 'http://127.0.0.1:5000/api' : '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sessionToken')
    config.headers.Authorization = token ? `Bearer ${token}` : undefined
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('sessionEmail')
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default api
