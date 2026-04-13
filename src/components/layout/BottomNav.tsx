import { useLocation, useNavigate } from 'react-router-dom'
import { Home, CalendarDays, Trophy, Image, User } from 'lucide-react'

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/calendar', icon: CalendarDays, label: '日历' },
  { path: '/badges', icon: Trophy, label: '勋章' },
  { path: '/album', icon: Image, label: '相册' },
  { path: '/profile', icon: User, label: '我的' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // 管理页面不显示底部导航
  if (location.pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {tabs.map(tab => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)
          const Icon = tab.icon

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-primary-500 scale-105'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-200
                  ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary-500' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary-500 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
