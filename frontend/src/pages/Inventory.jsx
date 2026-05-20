import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Inventory() {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [detalles, setDetalles] = useState([])
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState({ tipo_movimiento: "entrada", observacion: "" })
  const navigate = useNavigate()

  function cargar() {
    if (!localStorage.getItem("token")) return navigate("/")
    setLoading(true)
    Promise.all([
      api.get("/movimientos/"),
      api.get("/productos/"),
    ]).then(([mov, prod]) => {
      setMovimientos(mov.data)
      setProductos(prod.data)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  function abrirNuevo() {
    setForm({ tipo_movimiento: "entrada", observacion: "" })
    setDetalles([{ producto_id: "", cantidad: 1, serial: "" }])
    setShowForm(true)
  }

  function agregarDetalle() {
    setDetalles([...detalles, { producto_id: "", cantidad: 1, serial: "" }])
  }

  function quitarDetalle(i) {
    setDetalles(detalles.filter((_, idx) => idx !== i))
  }

  function cambiarDetalle(i, campo, valor) {
    const copy = [...detalles]
    copy[i][campo] = valor
    setDetalles(copy)
  }

  async function guardar(e) {
    e.preventDefault()
    const body = {
      tipo_movimiento: form.tipo_movimiento,
      observacion: form.observacion || null,
      detalles: detalles.map((d) => ({
        producto_id: d.producto_id,
        cantidad: Number(d.cantidad),
        serial: d.serial || null,
        observacion: null,
      })),
    }
    try {
      await api.post("/movimientos/", body)
      setShowForm(false)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al crear movimiento")
    }
  }

  const nomProd = (id) => productos.find((p) => p.id === id)?.nombre || id

  const tipoBadge = (t) => {
    if (t === "entrada") return "bg-green-50 text-green-700 border-green-200"
    if (t === "salida") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Movimientos de Inventario</h1>
          <p className="text-sm text-on-surface-variant mt-1">Registro de entradas y salidas</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#002576] to-[#131f61] text-white text-sm font-medium shadow-lg shadow-black/10 hover:shadow-xl hover:from-[#003099] hover:to-[#1a2a7a] transition-all duration-200">
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Movimiento
        </button>
      </div>

      {/* Table */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tipo</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Usuario</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Observación</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className={`status-badge border ${tipoBadge(m.tipo_movimiento)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.tipo_movimiento === "entrada" ? "bg-green-500" : m.tipo_movimiento === "salida" ? "bg-red-500" : "bg-amber-500"}`} />
                      {m.tipo_movimiento.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-on-surface">{m.fecha ? new Date(m.fecha).toLocaleString() : "-"}</td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{m.usuario_id}</td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{m.observacion || "-"}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-on-surface-variant">No hay movimientos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-on-surface">Nuevo Movimiento</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={guardar} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">Tipo *</label>
                <select value={form.tipo_movimiento} onChange={(e) => setForm({ ...form, tipo_movimiento: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all">
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface block mb-1.5">Observación</label>
                <input value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-on-surface">Productos</h4>
                  <button type="button" onClick={agregarDetalle}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#002576] bg-[#d4e3ff] hover:bg-[#c4d3ef] transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Agregar producto
                  </button>
                </div>
                <div className="space-y-3">
                  {detalles.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                      <select value={d.producto_id} onChange={(e) => cambiarDetalle(i, "producto_id", e.target.value)} required
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all">
                        <option value="">Seleccionar producto</option>
                        {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.marca})</option>)}
                      </select>
                      <input type="number" min="1" value={d.cantidad} onChange={(e) => cambiarDetalle(i, "cantidad", e.target.value)} required
                        className="w-20 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all" />
                      <input placeholder="Serial" value={d.serial} onChange={(e) => cambiarDetalle(i, "serial", e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all" />
                      <button type="button" onClick={() => quitarDetalle(i)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-lg">remove_circle</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#002576] to-[#131f61] hover:from-[#003099] hover:to-[#1a2a7a] shadow-lg shadow-black/10 transition-all duration-200">
                  Crear Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
