import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import api from "../services/api"

const CAT_COLORS = [
  "#002576", "#7991e5", "#9fcaff", "#131f61", "#16a34a",
  "#f59e0b", "#dc2626", "#8b5cf6",
]

const TABS = [
  { key: "global", label: "🌐 Global" },
  { key: "s1", label: "📍 Ramiriquí" },
  { key: "s2", label: "📍 Tunja" },
]

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState("global")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/")
    if (localStorage.getItem("rol_id") !== "r1") return navigate("/dashboard")
    api.get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>
  if (!data) return <div className="flex items-center justify-center h-64 text-on-surface-variant">Error al cargar</div>

  const { resumen, sedes, por_categoria, recomendaciones } = data
  const isGlobal = tab === "global"

  // Filtrar datos según tab activo
  const catData = isGlobal
    ? por_categoria
    : por_categoria.map((c) => ({
        categoria: c.categoria,
        cantidad: c[tab] || 0,
      })).filter((c) => c.cantidad > 0)

  const totalUnidades = isGlobal
    ? resumen.total_unidades_stock
    : (sedes[tab]?.total_unidades || 0)

  const totalItems = isGlobal
    ? Object.values(sedes).reduce((a, s) => a + s.items_stock, 0)
    : (sedes[tab]?.items_stock || 0)

  const sedesKeys = isGlobal ? Object.keys(sedes) : [tab]
  const todasAlertas = [
    ...(isGlobal ? data.criticos : data.criticos.filter((c) => c.sede_id === tab)),
    ...(isGlobal ? data.bajo_stock : data.bajo_stock.filter((c) => c.sede_id === tab)),
  ]
  const criticos = todasAlertas.filter((a) => a.cantidad <= 3)
  const bajos = todasAlertas.filter((a) => a.cantidad > 3 && a.cantidad <= 5)

  // Health data
  const healthData = isGlobal
    ? [
        { name: "Crítico", value: criticos.length, fill: "#dc2626" },
        { name: "Bajo", value: bajos.length, fill: "#f59e0b" },
        { name: "Saludable", value: Math.max(totalItems - criticos.length - bajos.length, 0), fill: "#16a34a" },
      ]
    : (() => {
        const stk = data.criticos.filter((c) => c.sede_id === tab).length
        const bk = data.bajo_stock.filter((c) => c.sede_id === tab).length
        return [
          { name: "Crítico", value: stk, fill: "#dc2626" },
          { name: "Bajo", value: bk, fill: "#f59e0b" },
          { name: "Saludable", value: Math.max(sedes[tab]?.items_stock - stk - bk, 0), fill: "#16a34a" },
        ]
      })()

  const pieData = isGlobal
    ? por_categoria.map((c) => ({ name: c.categoria, value: c.total }))
    : por_categoria.map((c) => ({ name: c.categoria, value: c[tab] })).filter((c) => c.value > 0)

  const filtRecs = isGlobal
    ? recomendaciones
    : recomendaciones.filter((r) => {
        if (r.tipo === "transferencia") return r.desde === sedes[tab]?.nombre || r.hacia === sedes[tab]?.nombre
        return true
      })

  return (
    <div className="space-y-8">
      {/* Header + Tabs */}
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Vista General</h1>
        <p className="text-sm text-on-surface-variant mt-1">Dashboard consolidado de todas las sedes</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? "bg-[#002576] text-white shadow-lg shadow-[#002576]/20"
                : "bg-white text-on-surface-variant border border-gray-200/50 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bento resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#001348] to-[#002576] text-white border border-white/10">
          <p className="text-2xl font-bold">{isGlobal ? resumen.total_productos : sedes[tab]?.productos || 0}</p>
          <p className="text-xs text-blue-200/70 mt-1">Productos</p>
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#002576] to-[#131f61] text-white border border-white/10">
          <p className="text-2xl font-bold">{totalUnidades.toLocaleString()}</p>
          <p className="text-xs text-blue-200/70 mt-1">Unidades en stock</p>
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200">
          <p className="text-2xl font-bold text-amber-700">{todasAlertas.length}</p>
          <p className="text-xs text-amber-600/70 mt-1">Items con stock bajo</p>
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-br from-green-50 to-green-50/50 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{isGlobal ? resumen.sedes : 1}</p>
          <p className="text-xs text-green-600/70 mt-1">{isGlobal ? "Sedes monitoreadas" : "Sede seleccionada"}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card p-6">
          <h3 className="text-sm font-semibold text-on-surface mb-1">Stock por Categoría</h3>
          <p className="text-xs text-on-surface-variant mb-4">{isGlobal ? "Comparativo entre sedes" : sedes[tab]?.nombre}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={catData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <XAxis dataKey="categoria" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              {isGlobal ? (
                <>
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="s1" name="Ramiriquí" fill="#002576" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="s2" name="Tunja" fill="#7991e5" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <Bar dataKey="cantidad" fill="#002576" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bento-card p-6">
          <h3 className="text-sm font-semibold text-on-surface mb-1">Distribución por Categoría</h3>
          <p className="text-xs text-on-surface-variant mb-4">{isGlobal ? "Stock total" : sedes[tab]?.nombre}</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card p-6">
          <h3 className="text-sm font-semibold text-on-surface mb-1">Salud del Stock</h3>
          <p className="text-xs text-on-surface-variant mb-4">{isGlobal ? "Todas las sedes" : sedes[tab]?.nombre}</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={healthData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value">
                {healthData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Per-sede cards (solo en Global) */}
        <div className="space-y-4">
          {isGlobal ? (
            Object.entries(sedes).map(([sid, info]) => (
              <div key={sid} className="bento-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sid === "s1" ? "bg-[#002576]/10 text-[#002576]" : "bg-[#131f61]/10 text-[#131f61]"}`}>
                    <span className="material-symbols-outlined text-xl">business</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">{info.nombre}</h3>
                    <p className="text-xs text-on-surface-variant">Sede {sid.toUpperCase()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-lg font-bold text-on-surface">{info.productos}</p><p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Productos</p></div>
                  <div><p className="text-lg font-bold text-on-surface">{info.items_stock}</p><p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Items</p></div>
                  <div><p className="text-lg font-bold text-on-surface">{info.total_unidades.toLocaleString()}</p><p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Unidades</p></div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#002576] to-[#7991e5]" style={{ width: `${(info.total_unidades / resumen.total_unidades_stock) * 100}%` }} />
                </div>
              </div>
            ))
          ) : (
            <div className="bento-card p-5 flex items-center justify-center h-full">
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl text-[#7991e5] mb-2">info</span>
                <p className="text-sm text-on-surface-variant">Cambia a la pestaña "Global" para ver el comparativo entre sedes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items Críticos */}
      {criticos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600 text-lg">error</span>
            <h3 className="text-base font-semibold text-on-surface">Items Críticos (≤ 3 uds)</h3>
            <span className="status-badge bg-red-50 text-red-700 border border-red-200 text-xs">{criticos.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticos.map((item, i) => (
              <div key={`c-${i}`} className="rounded-xl p-4 bg-white border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{item.producto_nombre}</p>
                    <p className="text-xs text-on-surface-variant">{item.sede_nombre} · {item.categoria}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-lg font-bold text-red-600">{item.cantidad}</p>
                    <p className="text-[10px] text-red-500/70">uds</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Bajo */}
      {bajos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-600 text-lg">priority_high</span>
            <h3 className="text-base font-semibold text-on-surface">Stock Bajo (4-5 uds)</h3>
            <span className="status-badge bg-amber-50 text-amber-700 border border-amber-200 text-xs">{bajos.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bajos.map((item, i) => (
              <div key={`b-${i}`} className="rounded-xl p-4 bg-white border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{item.producto_nombre}</p>
                    <p className="text-xs text-on-surface-variant">{item.sede_nombre} · {item.categoria}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-lg font-bold text-amber-600">{item.cantidad}</p>
                    <p className="text-[10px] text-amber-500/70">uds</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {filtRecs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#002576] text-lg">lightbulb</span>
            <h3 className="text-base font-semibold text-on-surface">Recomendaciones</h3>
            <span className="status-badge bg-[#d4e3ff] text-[#001a41] border border-[#d4e3ff] text-xs">{filtRecs.length}</span>
          </div>
          <div className="space-y-3">
            {filtRecs.map((rec, i) => (
              <div key={`r-${i}`} className="rounded-xl p-4 bg-gradient-to-r from-[#f8f9ff] to-white border border-[#d4e3ff] shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${rec.tipo === "transferencia" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    <span className="material-symbols-outlined text-lg">{rec.tipo === "transferencia" ? "swap_horiz" : "shopping_cart"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{rec.tipo === "transferencia" ? `Transferir ${rec.producto}` : `Comprar ${rec.producto}`}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{rec.motivo}</p>
                    {rec.tipo === "transferencia" && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">{rec.desde} → {rec.hacia}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4e3ff] text-[#001a41] font-medium">{rec.cantidad_sugerida} uds</span>
                      </div>
                    )}
                    {rec.tipo === "compra" && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">{rec.cantidad_sugerida} uds sugeridas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {todasAlertas.length === 0 && filtRecs.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-green-300 mb-3">check_circle</span>
          <p className="text-sm text-on-surface-variant">Todo en orden. No hay alertas ni recomendaciones pendientes.</p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
