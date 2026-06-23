import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tropels from './pages/Tropels'
import Signals from './pages/Signals'
import SignalDetail from './pages/SignalDetail'
import Sectors from './pages/Sectors'
import SectorStory from './pages/SectorStory'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tropels" element={<Tropels />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/signals/:id" element={<SignalDetail />} />
            <Route path="/sectors" element={<Sectors />} />
            <Route path="/sectors/:id/story" element={<SectorStory />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
