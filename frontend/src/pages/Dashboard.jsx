import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import api from "../services/api"

const CAT_COLORS = [
  "#002576", "#7991e5", "#9fcaff", "#131f61", "#16a34a",
  "#f59e0b", "#dc2626", "#8b5cf6",
]

function Dashboard() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [stock, setStock] = useState([])
  const [ultimos, setUltimos] = useState([])
  const [stats, setStats] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/")
    Promise.all([
      api.get("/productos/"),
      api.get("/categorias/"),
      api.get("/stock/"),
      api.get("/movimientos/"),
    ]).then(([prod, cat, stk, mov]) => {
      setProductos(prod.data)
      setCategorias(cat.data)
      setStock(stk.data)
      setUltimos(mov.data.slice(0, 5))
      setStats({
        productos: prod.data.length,
        categorias: cat.data.length,
        items_stock: stk.data.length,
        total_unidades: stk.data.reduce((a, s) => a + s.cantidad, 0),
        movimientos: mov.data.length,
      })
    }).catch(console.error)
  }, [navigate])

  const nomCat = (id) => categorias.find((c) => c.id === id)?.nombre || ""
  const sedeNombre = localStorage.getItem("sede_id") === "s1" ? "Ramiriquí" : "Tunja"

  // Stock por categoría
  const catStock = {}
  stock.forEach((s) => {
    const prod = productos.find((p) => p.id === s.producto_id)
    const cat = nomCat(prod?.categoria_id)
    if (!catStock[cat]) catStock[cat] = { categoria: cat, cantidad: 0 }
    catStock[cat].cantidad += s.cantidad
  })
  const porCategoria = Object.values(catStock).sort((a, b) => b.cantidad - a.cantidad)

  // Stock health
  const criticos = stock.filter((s) => s.cantidad <= 3).length
  const bajos = stock.filter((s) => s.cantidad > 3 && s.cantidad <= 5).length
  const saludables = stock.length - criticos - bajos
  const stockHealth = [
    { name: "Crítico", value: criticos, fill: "#dc2626" },
    { name: "Bajo", value: bajos, fill: "#f59e0b" },
    { name: "Saludable", value: Math.max(saludables, 0), fill: "#16a34a" },
  ]

  // Pie data
  const pieData = porCategoria.map((c) => ({ name: c.categoria, value: c.cantidad }))

  const tipoBadge = (t) => {
    if (t === "entrada") return "bg-green-50 text-green-700 border-green-200"
    if (t === "salida") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-1">Sede {sedeNombre}</p>
      </div>

      {/* Bento metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#001348] to-[#002576] text-white border border-white/10">
          <p className="text-2xl font-bold">{stats.productos || 0}</p>
          <p className="text-xs text-blue-200/70 mt-1">Productos</p>
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#002576] to-[#131f61] text-white border border-white/10">
          <p className="text-2xl font-bold">{stats.total_unidades || 0}</p>
          <p className="text-xs text-blue-200/70 mt-1">Unidades en stock</p>
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200">
          <p className="text-2xl font-bold text-amber-700">{criticos + bajos}</p>
          <p className="text-xs text-amber-600/70 mt-1">Items con stock bajo</p>
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-br from-green-50 to-green-50/50 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.movimientos || 0}</p>
          <p className="text-xs text-green-600/70 mt-1">Movimientos</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card p-6">
          <h3 className="text-sm font-semibold text-on-surface mb-1">Stock por Categoría</h3>
          <p className="text-xs text-on-surface-variant mb-4">{sedeNombre}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porCategoria} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <XAxis dataKey="categoria" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Bar dataKey="cantidad" fill="#002576" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bento-card p-6">
          <h3 className="text-sm font-semibold text-on-surface mb-1">Distribución por Categoría</h3>
          <p className="text-xs text-on-surface-variant mb-4">Porcentaje del stock</p>
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

      {/* Health + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card p-6">
          <h3 className="text-sm font-semibold text-on-surface mb-1">Salud del Stock</h3>
          <p className="text-xs text-on-surface-variant mb-4">Crítico vs Bajo vs Saludable</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stockHealth} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value">
                {stockHealth.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bento-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-on-surface">Actividad Reciente</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Últimos movimientos</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>
          </div>
          {ultimos.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">No hay movimientos recientes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tipo</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimos.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`status-badge border ${tipoBadge(m.tipo_movimiento)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.tipo_movimiento === "entrada" ? "bg-green-500" : "bg-red-500"}`} />
                          {m.tipo_movimiento.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-on-surface">{m.fecha ? new Date(m.fecha).toLocaleString() : "-"}</td>
                      <td className="py-3 px-3 text-sm text-on-surface-variant">{m.observacion || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
