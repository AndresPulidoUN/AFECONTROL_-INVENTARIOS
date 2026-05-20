import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Products() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtroCat, setFiltroCat] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: "", marca: "", modelo: "", referencia: "", categoria_id: "", descripcion: "", requiere_serial: false })
  const navigate = useNavigate()

  function cargar() {
    if (!localStorage.getItem("token")) return navigate("/")
    setLoading(true)
    Promise.all([
      api.get("/productos/", { params: filtroCat ? { categoria_id: filtroCat } : {} }),
      api.get("/categorias/"),
    ]).then(([prod, cat]) => {
      setProductos(prod.data)
      setCategorias(cat.data)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [filtroCat])

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: "", marca: "", modelo: "", referencia: "", categoria_id: categorias[0]?.id || "", descripcion: "", requiere_serial: false })
    setShowForm(true)
  }

  function abrirEditar(p) {
    setEditando(p)
    setForm({ nombre: p.nombre, marca: p.marca, modelo: p.modelo, referencia: p.referencia || "", categoria_id: p.categoria_id, descripcion: p.descripcion || "", requiere_serial: p.requiere_serial })
    setShowForm(true)
  }

  async function guardar(e) {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/productos/${editando.id}`, form)
      } else {
        await api.post("/productos/", form)
      }
      setShowForm(false)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al guardar")
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este producto?")) return
    try {
      await api.delete(`/productos/${id}`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al eliminar")
    }
  }

  const nomCat = (id) => categorias.find((c) => c.id === id)?.nombre || id

  const filtrados = productos.filter((p) =>
    !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.marca.toLowerCase().includes(search.toLowerCase()) || p.modelo.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Productos</h1>
          <p className="text-sm text-on-surface-variant mt-1">Gestión de productos del inventario</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#002576] to-[#131f61] text-white text-sm font-medium shadow-lg shadow-black/10 hover:shadow-xl hover:from-[#003099] hover:to-[#1a2a7a] transition-all duration-200">
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input type="text" placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
        </div>
        <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200/50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all">
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nombre</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Marca</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Modelo</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Categoría</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Serial</th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-sm font-medium text-on-surface">{p.nombre}</td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{p.marca}</td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{p.modelo}</td>
                  <td className="py-3.5 px-4">
                    <span className="status-badge bg-[#d4e3ff] text-[#001a41] border border-[#d4e3ff]">{nomCat(p.categoria_id)}</span>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{p.requiere_serial ? "Sí" : "No"}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => abrirEditar(p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors mr-2">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Editar
                    </button>
                    <button onClick={() => eliminar(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-on-surface-variant">No se encontraron productos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-on-surface">{editando ? "Editar Producto" : "Nuevo Producto"}</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface block mb-1.5">Marca *</label>
                  <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface block mb-1.5">Modelo *</label>
                  <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">Referencia</label>
                <input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">Categoría *</label>
                <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all">
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all min-h-[80px]" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.requiere_serial} onChange={(e) => setForm({ ...form, requiere_serial: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#002576] focus:ring-[#002576]/30" />
                <span className="text-sm text-on-surface">Requiere serial</span>
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

export default Products
