import { Navigate, Route, Routes } from 'react-router-dom'
import Store from './pages/Store'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function Protected({ children }) {
  return localStorage.getItem('ar_admin') === '1' ? children : <Navigate to="/admin" replace />
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Store />} />
    <Route path="/admin" element={<AdminLogin />} />
    <Route path="/admin/painel" element={<Protected><AdminDashboard /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
