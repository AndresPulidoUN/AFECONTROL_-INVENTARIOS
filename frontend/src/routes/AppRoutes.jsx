import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import Inventory from "../pages/Inventory"
import Products from "../pages/Products"
import Users from "../pages/Users"
import StockView from "../pages/StockView"
import Alertas from "../pages/Alertas"
import AdminDashboard from "../pages/AdminDashboard"
import MainLayout from "../layouts/MainLayout"

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")
  return token ? <MainLayout>{children}</MainLayout> : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><StockView /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/alertas" element={<ProtectedRoute><Alertas /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
