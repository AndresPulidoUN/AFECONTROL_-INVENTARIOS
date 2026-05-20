import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Alertas() {
  const [stock, setStock] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  const critical = stock.filter((s) => s.cantidad <= 3)
  const low = stock.filter((s) => s.cantidad > 3 && s.cantidad <= 10)
  const healthy = stock.filter((s) => s.cantidad > 10)

  if (loading) return <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Alertas de Stock</h1>
        <p className="text-sm text-on-surface-variant mt-1">Monitoreo de niveles de inventario</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-red-50 to-red-50/50 border border-red-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-red-600">warning</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{critical.length}</p>
              <p className="text-xs text-red-600/70">Críticos</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-red-200 overflow-hidden">
            <div className="h-full rounded-full bg-red-500" style={{ width: `${stock.length ? (critical.length / stock.length) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-amber-600">priority_high</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{low.length}</p>
              <p className="text-xs text-amber-600/70">Stock Bajo</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-amber-200 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${stock.length ? (low.length / stock.length) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-br from-green-50 to-green-50/50 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{healthy.length}</p>
              <p className="text-xs text-green-600/70">Stock Saludable</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-green-200 overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${stock.length ? (healthy.length / stock.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Critical items */}
      {critical.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600 text-lg">error</span>
            <h3 className="text-base font-semibold text-on-surface">Items Críticos</h3>
            <span className="status-badge bg-red-50 text-red-700 border border-red-200 text-xs">{critical.length} items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {critical.map((s) => (
              <div key={s.id} className="rounded-xl p-4 bg-white border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{nomProd(s.producto_id)}</p>
                    <p className="text-xs text-on-surface-variant">{marcaProd(s.producto_id)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{s.cantidad}</p>
                    <p className="text-[10px] text-red-500/70">unidades</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low stock items */}
      {low.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-600 text-lg">priority_high</span>
            <h3 className="text-base font-semibold text-on-surface">Stock Bajo</h3>
            <span className="status-badge bg-amber-50 text-amber-700 border border-amber-200 text-xs">{low.length} items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {low.map((s) => (
              <div key={s.id} className="rounded-xl p-4 bg-white border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{nomProd(s.producto_id)}</p>
                    <p className="text-xs text-on-surface-variant">{marcaProd(s.producto_id)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-600">{s.cantidad}</p>
                    <p className="text-[10px] text-amber-500/70">unidades</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Healthy items */}
      {healthy.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <h3 className="text-base font-semibold text-on-surface">Stock Saludable</h3>
            <span className="status-badge bg-green-50 text-green-700 border border-green-200 text-xs">{healthy.length} items</span>
          </div>
          <div className="bento-card p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Producto</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {healthy.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3 text-sm text-on-surface">{nomProd(s.producto_id)}</td>
                      <td className="py-3 px-3 text-sm font-semibold text-green-700 text-right">{s.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {stock.length === 0 && (
        <div className="text-center py-12 text-sm text-on-surface-variant">No hay stock registrado</div>
      )}
    </div>
  )
}

export default Alertas
