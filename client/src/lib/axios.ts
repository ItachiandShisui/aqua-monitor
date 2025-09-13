import axios from 'axios'

const baseURL = import.meta.env.MODE === 'development' ? 'http://127.0.0.1:5000/api' : '/api'

const api = axios.create({ baseURL })

export default api
