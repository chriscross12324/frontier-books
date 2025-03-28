import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router'
import './index.css'
import './styles.css'
import Checkout from './pages/Checkout.jsx'
import Contact from './pages/Contact.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { CartProvider } from './services/CartContext.jsx'
import { NotificationProvider } from './components/Notification.jsx'
import { AuthProvider } from './services/AuthContext.jsx'
import { DialogProvider } from './services/DialogContext.jsx'

const root = document.getElementById('root');

createRoot(root).render(
  <NotificationProvider>
    <HashRouter>
      <DialogProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/checkout' element={<Checkout />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/user' element={<UserDashboard />} />
              <Route path='/admin' element={<AdminDashboard />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </DialogProvider>
    </HashRouter>
  </NotificationProvider>
)
