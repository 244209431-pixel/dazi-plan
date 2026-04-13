import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '@/store'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import CalendarPage from '@/pages/CalendarPage'
import ActivityDetailPage from '@/pages/ActivityDetailPage'
import BadgesPage from '@/pages/BadgesPage'
import AlbumPage from '@/pages/AlbumPage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import FamilyManage from '@/pages/admin/FamilyManage'
import ActivityManage from '@/pages/admin/ActivityManage'
import ChapterManage from '@/pages/admin/ChapterManage'
import AppLayout from '@/components/layout/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const restoreSession = useAuthStore(s => s.restoreSession)
  const loadAppData = useAppStore(s => s.loadAppData)

  useEffect(() => {
    loadAppData()
    restoreSession()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/activity/:id" element={<ActivityDetailPage />} />
                <Route path="/badges" element={<BadgesPage />} />
                <Route path="/album" element={<AlbumPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/families" element={<FamilyManage />} />
                <Route path="/admin/activities" element={<ActivityManage />} />
                <Route path="/admin/chapters" element={<ChapterManage />} />
                <Route path="/admin/registrations" element={<RegistrationManage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
