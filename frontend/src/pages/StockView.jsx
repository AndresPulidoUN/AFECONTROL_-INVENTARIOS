import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function StockView() {
  const [stock, setStock] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editKey, setEditKey] = useState(null)
  const [nuevaCant, setNuevaCant] = useState("")
  const [search, setSearch] = useState("")
  const [sedeTab, setSedeTab] = useState("all")
  const navigate = useNavigate()
  const isAdmin = localStorage.getItem("rol_id") === "r1"

  function cargar() {
    if (!localStorage.getItem("token")) return navigate("/")
    setLoading(true)
    Promise.all([
      api.get("/stock/"),
      api.get("/productos/"),
    ]).then(([s, p]) => {
      setStock(s.data)
      setProductos(p.data)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const nomProd = (id) => productos.find((p) => p.id === id)?.nombre || id
  const marcaProd = (id) => productos.find((p) => p.id === id)?.marca || ""
  const sedeNombre = (sid) => sid === "s1" ? "Ramiriquí" : "Tunja"

  const stockFiltrado = isAdmin && sedeTab !== "all"
    ? stock.filter((s) => s.sede_id === sedeTab)
    : stock

  const maxStock = Math.max(...stockFiltrado.map((s) => s.cantidad), 1)

  async function guardarCantidad(producto_id, stock_sede_id) {
    try {
      const params = isAdmin && sedeTab !== "all" ? { params: { sede_id: stock_sede_id || sedeTab } } : {}
      await api.put(`/stock/${producto_id}`, { cantidad: Number(nuevaCant) }, params)
      setEditKey(null)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al actualizar")
    }
  }

  const filtrados = stockFiltrado.filter((s) =>
    !search || nomProd(s.producto_id).toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Stock Actual</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {isAdmin ? "Vista administrativa — todas las sedes" : `Sede ${sedeNombre(localStorage.getItem("sede_id"))}`}
        </p>
      </div>

      {/* Sede tabs for admin */}
      {isAdmin && (
        <div className="flex gap-2">
          {[
            { key: "all", label: "🌐 Todas" },
            { key: "s1", label: "📍 Ramiriquí" },
            { key: "s2", label: "📍 Tunja" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSedeTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                sedeTab === t.key
                  ? "bg-[#002576] text-white shadow-lg shadow-[#002576]/20"
                  : "bg-white text-on-surface-variant border border-gray-200/50 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input type="text" placeholder="Buscar en stock..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all" />
      </div>

      {/* Stock cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((s) => {
          const pct = Math.min(Math.round((s.cantidad / maxStock) * 100), 100)
          const isLow = s.cantidad <= 5
          return (
            <div key={s.id} className={`bento-card p-5 ${isLow ? "border-amber-200/50" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-on-surface truncate">{nomProd(s.producto_id)}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{marcaProd(s.producto_id)}</p>
                  {isAdmin && (
                    <span className={`inline-block text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full ${
                      s.sede_id === "s1" ? "bg-[#d4e3ff] text-[#002576]" : "bg-[#e8d4ff] text-[#5b21b6]"
                    }`}>
                      {sedeNombre(s.sede_id)}
                    </span>
                  )}
                </div>
                {isLow && (
                  <span className="status-badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Mínimo
                  </span>
                )}
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-on-surface-variant">Stock</span>
                  <span className="font-semibold text-on-surface">{s.cantidad}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? "bg-amber-400" : "bg-gradient-to-r from-[#002576] to-[#7991e5]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editKey === `${s.producto_id}:${s.sede_id}` ? (
                  <>
                    <input type="number" min="0" value={nuevaCant} onChange={(e) => setNuevaCant(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30" />
                    <button onClick={() => guardarCantidad(s.producto_id, s.sede_id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                      Guardar
                    </button>
                    <button onClick={() => setEditKey(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant bg-gray-100 hover:bg-gray-200 transition-colors">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditKey(`${s.producto_id}:${s.sede_id}`); setNuevaCant(String(s.cantidad)) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#002576] bg-[#d4e3ff] hover:bg-[#c4d3ef] transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Ajustar
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-on-surface-variant">No hay stock registrado</div>
        )}
      </div>
    </div>
  )
}

export default StockView
