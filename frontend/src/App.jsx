import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import SenderSignIn from './pages/SenderSignIn'
import ForgotPassword from './pages/ForgotPassword'
import Waitlist from './pages/Waitlist'
import NotFound from './pages/NotFound'

// Student pages
import Onboarding from './pages/Onboarding'
import Feed from './pages/Feed'
import MyCourses from './pages/MyCourses'
import Account from './pages/Account'

// Sender pages
import Portal from './pages/sender/Portal'
import History from './pages/sender/History'

// Admin pages
import Dashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#111827',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/sender" element={<SenderSignIn />} />
          <Route path="/reset" element={<ForgotPassword />} />
          <Route path="/waitlist" element={<Waitlist />} />

          {/* Student */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Account />
              </ProtectedRoute>
            }
          />

          {/* Sender */}
          <Route
            path="/sender/portal"
            element={
              <ProtectedRoute allowedRoles={['sender']} redirectTo="/sender">
                <Portal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sender/history"
            element={
              <ProtectedRoute allowedRoles={['sender']} redirectTo="/sender">
                <History />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']} redirectTo="/">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
