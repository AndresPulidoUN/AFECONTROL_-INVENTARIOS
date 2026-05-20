import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Login() {
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { correo, password })
      const data = res.data
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("usuario_id", data.usuario_id)
      localStorage.setItem("nombre", data.nombre)
      localStorage.setItem("correo", data.correo)
      localStorage.setItem("rol_id", data.rol_id)
      localStorage.setItem("sede_id", data.sede_id)
      navigate(data.rol_id === "r1" ? "/admin/dashboard" : "/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#001348]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#002576]/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#131f61]/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#002576]/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-lg shadow-black/20 mb-4 overflow-hidden">
            <img src="/logo.jpg" className="w-16 h-16 object-contain" alt="AFE" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AFECONTROL</h1>
          <p className="text-blue-200/60 text-sm mt-1 font-medium">Infrastructure Command</p>
        </div>

        {/* Login card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Iniciar Sesión</h2>
          <p className="text-blue-200/50 text-sm mb-6">Ingrese sus credenciales</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-4">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-blue-200/70 text-sm font-medium block mb-1.5">Correo electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300/40 text-lg">mail</span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  placeholder="usuario@isp.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#7991e5]/40 focus:border-[#7991e5]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-blue-200/70 text-sm font-medium block mb-1.5">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300/40 text-lg">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#7991e5]/40 focus:border-[#7991e5]/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#002576] to-[#131f61] text-white font-semibold text-sm shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:from-[#003099] hover:to-[#1a2a7a] disabled:opacity-60 transition-all duration-200"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-200/30 text-xs mt-6">AFECONTROL v1.0 — Sistema de Gestión de Inventarios</p>
      </div>
    </div>
  )
}

export default Login
