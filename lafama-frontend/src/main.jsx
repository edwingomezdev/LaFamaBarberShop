import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LaFamaBarber from './LaFamaBarber_prd2.jsx'
import AdminPanel from './AdminPanel_prd2.jsx'
import BarberView from './BarberView.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LaFamaBarber />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/barbero" element={<BarberView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)