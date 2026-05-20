import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Users() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", rol_id: "r2", sede_id: "s1", activo: true })
  const navigate = useNavigate()

  function cargar() {
    if (!localStorage.getItem("token")) return navigate("/")
    if (localStorage.getItem("rol_id") !== "r1") return navigate("/dashboard")
    setLoading(true)
    api.get("/usuarios/")
      .then((res) => setUsuarios(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: "", correo: "", password: "", rol_id: "r2", sede_id: "s1", activo: true })
    setShowForm(true)
  }

  function abrirEditar(u) {
    setEditando(u)
    setForm({ nombre: u.nombre, correo: u.correo, password: "", rol_id: u.rol_id, sede_id: u.sede_id, activo: u.activo })
    setShowForm(true)
  }

  async function guardar(e) {
    e.preventDefault()
    try {
      const body = { ...form }
      if (editando && !body.password) delete body.password
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, body)
      } else {
        await api.post("/usuarios/", body)
      }
      setShowForm(false)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al guardar")
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este usuario?")) return
    try {
      await api.delete(`/usuarios/${id}`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al eliminar")
    }
  }

  const nomRol = (r) => r === "r1" ? "Admin" : "Técnico"
  const nomSede = (s) => s === "s1" ? "Ramiriquí" : "Tunja"

  if (loading) return <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>
  if (localStorage.getItem("rol_id") !== "r1") return <div className="flex items-center justify-center h-64 text-on-surface-variant">Acceso no autorizado</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Usuarios</h1>
          <p className="text-sm text-on-surface-variant mt-1">Gestión de usuarios del sistema</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#002576] to-[#131f61] text-white text-sm font-medium shadow-lg shadow-black/10 hover:shadow-xl hover:from-[#003099] hover:to-[#1a2a7a] transition-all duration-200">
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nombre</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Correo</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rol</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sede</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Estado</th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-sm font-medium text-on-surface">{u.nombre}</td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{u.correo}</td>
                  <td className="py-3.5 px-4">
                    <span className={`status-badge ${u.rol_id === "r1" ? "bg-[#d4e3ff] text-[#001a41]" : "bg-gray-100 text-on-surface-variant"} border`}>
                      {nomRol(u.rol_id)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{nomSede(u.sede_id)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`status-badge ${u.activo ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? "bg-green-500" : "bg-red-500"}`} />
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => abrirEditar(u)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors mr-2">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Editar
                    </button>
                    <button onClick={() => eliminar(u.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-on-surface-variant">No hay usuarios registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-on-surface">{editando ? "Editar Usuario" : "Nuevo Usuario"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={guardar} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">Nombre *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">Correo *</label>
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">{editando ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editando}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface block mb-1.5">Rol *</label>
                  <select value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all">
                    <option value="r1">Admin</option>
                    <option value="r2">Técnico</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface block mb-1.5">Sede *</label>
                  <select value={form.sede_id} onChange={(e) => setForm({ ...form, sede_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all">
                    <option value="s1">Ramiriquí</option>
                    <option value="s2">Tunja</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#002576] focus:ring-[#002576]/30" />
                <span className="text-sm text-on-surface">Activo</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#002576] to-[#131f61] hover:from-[#003099] hover:to-[#1a2a7a] shadow-lg shadow-black/10 transition-all duration-200">
                  {editando ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
