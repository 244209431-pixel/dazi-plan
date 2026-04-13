import { useAuthStore, useAppStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, Sparkles } from 'lucide-react'

export default function Navbar() {
  const currentFamily = useAuthStore(s => s.currentFamily)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const logout = useAuthStore(s => s.logout)
  const activeChapter = useAppStore(s => s.activeChapter)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* 左侧：Logo + 章节 */}
        <div className="flex items-center gap-2" onClick={() => navigate('/')}>
          <span className="text-2xl">🎪</span>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight font-display">搭子计划</h1>
            {activeChapter && (
              <p className="text-[10px] text-primary-500 leading-tight">
                {activeChapter.title} · {activeChapter.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 右侧：管理 + 家庭头像 */}
        <div className="flex items-center gap-2">
          {isAdmin() && (
            <button
              onClick={() => navigate('/admin')}
              className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center
                         hover:bg-primary-100 transition-colors"
            >
              <Settings className="w-4 h-4 text-primary-500" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-warm-400
                            flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {currentFamily?.name?.charAt(0) || '?'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center
                       hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  )
}
