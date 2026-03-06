import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import EventDetailsPage from './pages/EventDetailsPage'
import CreateEventPage from './pages/CreateEventPage'
import EditEventPage from './pages/EditEventPage'
import CreateMemberPage from './pages/CreateMemberPage'
import EditMemberPage from './pages/EditMemberPage'
import CalendarPage from './pages/CalendarPage'
import MembersPage from './pages/MembersPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import VerseOfTheDay from './components/VerseOfTheDay'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events" element={
              <ProtectedRoute>
                <Layout>
                  <EventsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/create" element={
              <ProtectedRoute requiredRole="leader">
                <Layout>
                  <CreateEventPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id/edit" element={
              <ProtectedRoute requiredRole="leader">
                <Layout>
                  <EditEventPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EventDetailsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Layout>
                  <CalendarPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/members" element={
              <ProtectedRoute requiredRole="leader">
                <Layout>
                  <MembersPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/members/create" element={
              <ProtectedRoute requiredRole="leader">
                <Layout>
                  <CreateMemberPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/members/:id/edit" element={
              <ProtectedRoute requiredRole="leader">
                <Layout>
                  <EditMemberPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Layout>
                  <NotificationsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Componentes globais */}
          <VerseOfTheDay />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  border: '2px solid #8B0000',
                  borderLeft: '6px solid #8B0000',
                },
                iconTheme: {
                  primary: '#8B0000',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 6000,
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  border: '2px solid #EF4444',
                  borderLeft: '6px solid #EF4444',
                },
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
              loading: {
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  border: '2px solid #D4C4B0',
                  borderLeft: '6px solid #D4C4B0',
                },
                iconTheme: {
                  primary: '#D4C4B0',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App