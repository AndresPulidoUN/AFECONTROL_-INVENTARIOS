import { useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import SedeSelector from "../components/SedeSelector"

const navItems = [
  { label: "Vista General", path: "/admin/dashboard", icon: "globe", adminOnly: true },
  { label: "Dashboard",   path: "/dashboard",  icon: "dashboard", techOnly: true },
  { label: "Productos",   path: "/products",   icon: "inventory_2" },
  { label: "Stock",       path: "/stock",      icon: "inventory" },
  { label: "Movimientos", path: "/inventory",  icon: "swap_horiz" },
  { label: "Alertas",     path: "/alertas",    icon: "warning" },
  { label: "Usuarios",    path: "/users",      icon: "group", adminOnly: true },
]

const pageTitles = {
  "/dashboard": "Dashboard",
  "/admin/dashboard": "Vista General",
  "/products": "Productos",
  "/stock": "Stock",
  "/inventory": "Movimientos",
  "/alertas": "Alertas",
  "/users": "Usuarios",
}

const sedeNombre = (id) => id === "s1" ? "Ramiriquí" : "Tunja"

function MainLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sedeKey, setSedeKey] = useState(0)
  const nombre = localStorage.getItem("nombre") || ""
  const rol = localStorage.getItem("rol_id") || ""
  const isAdmin = rol === "r1"

  function handleSedeChange() {
    setSedeKey((k) => k + 1)
  }

  function logout() {
    localStorage.clear()
    navigate("/")
  }

  const title = pageTitles[location.pathname] || "AFECONTROL"

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] z-30 flex flex-col bg-[#001d3d] text-white">
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.jpg" className="w-8 h-8 object-contain" alt="AFE" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">AFECONTROL</h1>
              <p className="text-[10px] text-blue-300/70 font-medium uppercase tracking-widest">Infrastructure Command</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-4 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null
            if (item.techOnly && isAdmin) return null
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-blue-200/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${active ? "text-on-primary-container" : ""}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-4 pb-6 mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#002576] to-[#131f61] flex items-center justify-center text-sm font-semibold shadow-inner">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{nombre}</p>
              <p className="text-[11px] text-blue-300/60">{isAdmin ? "Administrador" : "Técnico"}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="mb-3">
              <label className="text-[10px] text-blue-300/50 uppercase tracking-wider font-medium block mb-1.5">Sede activa</label>
              <SedeSelector onSedeChange={handleSedeChange} />
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-300/80 hover:text-red-200 hover:bg-red-500/10 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="ml-[280px] flex-1 min-h-screen">
        {/* Top navbar */}
        <header className="glass-nav sticky top-0 z-20 px-8 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-on-surface">{title}</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isAdmin ? "Sede: " + (localStorage.getItem("sede_id") === "s1" ? "Ramiriquí" : "Tunja") : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-64 pl-10 pr-4 py-2 rounded-xl bg-white/60 border border-gray-200/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all"
              />
            </div>
            <button className="w-9 h-9 rounded-xl bg-white/60 border border-gray-200/50 flex items-center justify-center text-on-surface-variant hover:bg-white/80 transition-all">
              <span className="material-symbols-outlined text-lg">notifications</span>
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/60 border border-gray-200/50 flex items-center justify-center text-on-surface-variant hover:bg-white/80 transition-all">
              <span className="material-symbols-outlined text-lg">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main key={sedeKey} className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
