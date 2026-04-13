import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '@/store'
import { calcAttendance, calcFamilyBadges } from '@/utils/deriveStats'
import { ACTIVITY_CATEGORIES } from '@/lib/constants'
import {
  CalendarDays, Trophy, Image, BarChart3, 
  ChevronRight, Clock, MapPin, Sparkles, Users
} from 'lucide-react'

export default function HomePage() {
  const currentFamily = useAuthStore(s => s.currentFamily)
  const data = useAppStore(s => s.data)
  const activeChapter = useAppStore(s => s.activeChapter)
  const navigate = useNavigate()

  // 派生数据
  const stats = useMemo(() => {
    if (!currentFamily) return null
    const attendance = calcAttendance(
      currentFamily.id, currentFamily.name,
      data.activities, data.checkIns
    )
    const badges = calcFamilyBadges(
      currentFamily.id, data.activities, data.checkIns, data.manualBadges
    )
    return { attendance, badges }
  }, [currentFamily, data.activities, data.checkIns, data.manualBadges])

  // 下一次活动
  const nextActivity = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10)
    return data.activities
      .filter(a => a.status === 'planned' && a.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date))[0]
  }, [data.activities])

  // 最近活动
  const recentActivities = useMemo(() => {
    return data.activities
      .filter(a => a.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
  }, [data.activities])

  const hostFamily = nextActivity
    ? data.families.find(f => f.id === nextActivity.hostFamilyId)
    : null

  // 快捷入口
  const quickLinks = [
    { icon: CalendarDays, label: '活动日历', path: '/calendar', color: 'from-sky-400 to-sky-500' },
    { icon: Trophy, label: '勋章墙', path: '/badges', color: 'from-primary-400 to-warm-400' },
    { icon: Image, label: '活动相册', path: '/album', color: 'from-mint-400 to-mint-500' },
    { icon: BarChart3, label: '排行榜', path: '/leaderboard', color: 'from-lavender-400 to-lavender-500' },
  ]

  return (
    <div className="page-container space-y-5">
      {/* 欢迎卡片 */}
      <div className="gradient-warm rounded-3xl p-5 text-white shadow-glow animate-fade-in">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-white/80">
              {activeChapter ? `${activeChapter.title} · ${activeChapter.subtitle}` : '尚未开始'}
            </p>
            <h2 className="text-xl font-bold font-display mt-1">
              你好，{currentFamily?.name || '搭子'} 👋
            </h2>
          </div>
          <Sparkles className="w-6 h-6 text-white/60" />
        </div>

        {nextActivity ? (
          <div className="bg-white/15 rounded-2xl p-3 mt-3 backdrop-blur-sm">
            <p className="text-xs text-white/70 mb-1">📅 下次活动</p>
            <p className="font-semibold text-sm">{nextActivity.title}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {nextActivity.date}
              </span>
              {hostFamily && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {hostFamily.name} 轮值
                </span>
              )}
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20`}>
                {ACTIVITY_CATEGORIES[nextActivity.category]?.emoji} {ACTIVITY_CATEGORIES[nextActivity.category]?.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white/15 rounded-2xl p-3 mt-3 backdrop-blur-sm text-center">
            <p className="text-sm text-white/80">暂无计划中的活动</p>
            <p className="text-xs text-white/60 mt-1">管理员可以在后台创建活动</p>
          </div>
        )}
      </div>

      {/* 快捷功能入口 */}
      <div className="grid grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {quickLinks.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white shadow-sm
                       hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} 
                            flex items-center justify-center shadow-sm`}>
              <link.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-600">{link.label}</span>
          </button>
        ))}
      </div>

      {/* 我的数据概览 */}
      {stats && (
        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <span className="text-lg">📊</span> 我的探索数据
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-sky-50 rounded-xl">
              <p className="text-2xl font-bold text-sky-600">{stats.attendance.attended}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">参加活动</p>
            </div>
            <div className="text-center p-2 bg-primary-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600">{stats.badges.totalUnlocked}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">获得勋章</p>
            </div>
            <div className="text-center p-2 bg-mint-50 rounded-xl">
              <p className="text-2xl font-bold text-mint-600">{stats.attendance.rate}%</p>
              <p className="text-[10px] text-gray-500 mt-0.5">出勤率</p>
            </div>
          </div>
        </div>
      )}

      {/* 最近动态 */}
      {recentActivities.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <span className="text-lg">🕐</span> 最近活动
          </h3>
          <div className="space-y-2">
            {recentActivities.map(activity => {
              const cat = ACTIVITY_CATEGORIES[activity.category]
              return (
                <button
                  key={activity.id}
                  onClick={() => navigate(`/activity/${activity.id}`)}
                  className="w-full card-float flex items-center gap-3 p-3 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl ${cat?.bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
                    {cat?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {data.activities.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">欢迎来到搭子计划！</h3>
          <p className="text-sm text-gray-500 mb-4">
            这里是家庭遛娃搭子社群的家园<br />
            让我们一起开始探索之旅吧！
          </p>
          {useAuthStore.getState().isAdmin() && (
            <button
              onClick={() => navigate('/admin')}
              className="btn-primary"
            >
              前往管理后台设置
            </button>
          )}
        </div>
      )}
    </div>
  )
}
