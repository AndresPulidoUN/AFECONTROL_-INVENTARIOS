import axios from "axios"

const api = axios.create({
  baseURL: "/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const sede = localStorage.getItem("sede_id")
  if (sede) {
    config.headers["sede_db"] = sede
  }
  return config
})

export default api
