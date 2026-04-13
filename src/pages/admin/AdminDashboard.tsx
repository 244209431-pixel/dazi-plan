// ============================================
// 管理后台 - 总览仪表盘
// ============================================

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useAuthStore } from '@/store'
import { calcLeaderboard } from '@/utils/deriveStats'
import { ACTIVITY_CATEGORIES, CHAPTER_THEMES } from '@/lib/constants'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const data = useAppStore(s => s.data)
  const activeChapter = useAppStore(s => s.activeChapter)
  const isSuperAdmin = useAuthStore(s => s.isSuperAdmin)

  // --- 派生统计 ---
  const stats = useMemo(() => {
    const totalFamilies = data.families.filter(f => f.role !== 'superadmin').length
    const totalActivities = data.activities.length
    const completedActivities = data.activities.filter(a => a.status === 'completed').length
    const totalCheckIns = data.checkIns.length
    const totalPhotos = data.photos.length
    const totalComments = data.comments.length

    // 当前章节活动
    const chapterActivities = activeChapter
      ? data.activities.filter(a => a.chapterId === activeChapter.id)
      : []
    const chapterCompleted = chapterActivities.filter(a => a.status === 'completed').length
    const chapterPlanned = chapterActivities.filter(a => a.status === 'planned').length

    // 分类统计
    const categoryStats = Object.keys(ACTIVITY_CATEGORIES).map(cat => ({
      category: cat,
      count: data.activities.filter(a => a.category === cat).length,
    }))

    // 出勤排行前3
    const leaderboard = calcLeaderboard(data.families, data.activities, data.checkIns).slice(0, 3)

    // 待审核注册
    const pendingRegistrations = data.registrations ? data.registrations.filter((r: any) => r.status === 'pending').length : 0

    return {
      totalFamilies,
      totalActivities,
      completedActivities,
      totalCheckIns,
      totalPhotos,
      totalComments,
      chapterActivities: chapterActivities.length,
      chapterCompleted,
      chapterPlanned,
      categoryStats,
      leaderboard,
      pendingRegistrations,
    }
  }, [data, activeChapter])

  // --- 快捷入口 ---
  const quickLinks = [
    { label: '家庭管理', emoji: '👨‍👩‍👧‍👦', path: '/admin/families', color: 'from-primary-400 to-primary-500', desc: `${stats.totalFamilies} 个家庭` },
    { label: '活动管理', emoji: '📅', path: '/admin/activities', color: 'from-sky-400 to-sky-500', desc: `${stats.totalActivities} 场活动` },
    { label: '章节管理', emoji: '📖', path: '/admin/chapters', color: 'from-lavender-400 to-lavender-500', desc: activeChapter ? `${activeChapter.title}·${activeChapter.subtitle}` : '未设置' },
    { label: '注册审批', emoji: '📋', path: '/admin/registrations', color: 'from-rose-400 to-rose-500', desc: stats.pendingRegistrations > 0 ? `${stats.pendingRegistrations} 待审核` : '暂无新申请' },
    { label: '排行榜', emoji: '🏆', path: '/leaderboard', color: 'from-warm-400 to-warm-500', desc: '查看出勤排名' },
  ]

  return (
    <div className="page-container pb-24">
      {/* 顶部标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isSuperAdmin() ? '超级管理员' : '管理员'} · 管理你的搭子社区
        </p>
      </div>

      {/* 当前章节卡片 */}
      <div className="bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-2xl p-5 text-white mb-6 shadow-card">
        {activeChapter ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-xs mb-1">当前章节</div>
              <div className="text-xl font-bold">{activeChapter.title} · {activeChapter.subtitle}</div>
              <div className="text-white/80 text-sm mt-1">
                {stats.chapterCompleted} 场已完成 · {stats.chapterPlanned} 场待进行
              </div>
            </div>
            <div className="text-4xl">
              {CHAPTER_THEMES.find(t => t.title === activeChapter.title)?.emoji || '📖'}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-xs mb-1">未设置章节</div>
              <div className="text-lg font-bold">开始第一章旅程吧！</div>
              <button
                onClick={() => navigate('/admin/chapters')}
                className="mt-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full transition-colors"
              >
                创建章节 →
              </button>
            </div>
            <div className="text-4xl">🚀</div>
          </div>
        )}
      </div>

      {/* 统计数字 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '家庭', value: stats.totalFamilies, emoji: '🏠', color: 'bg-primary-50 text-primary-600' },
          { label: '活动', value: stats.totalActivities, emoji: '📅', color: 'bg-sky-50 text-sky-600' },
          { label: '签到', value: stats.totalCheckIns, emoji: '✅', color: 'bg-mint-50 text-mint-600' },
          { label: '已完成', value: stats.completedActivities, emoji: '🎉', color: 'bg-warm-50 text-warm-600' },
          { label: '照片', value: stats.totalPhotos, emoji: '📸', color: 'bg-lavender-50 text-lavender-600' },
          { label: '留言', value: stats.totalComments, emoji: '💬', color: 'bg-rose-50 text-rose-600' },
        ].map(item => (
          <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
            <div className="text-lg">{item.emoji}</div>
            <div className="text-xl font-bold">{item.value}</div>
            <div className="text-xs opacity-70">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 快捷入口 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">快捷管理</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`bg-gradient-to-br ${link.color} rounded-xl p-4 text-white text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0`}
            >
              <div className="text-2xl mb-2">{link.emoji}</div>
              <div className="font-bold">{link.label}</div>
              <div className="text-white/80 text-xs mt-0.5">{link.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 分类活动统计 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">活动分类分布</h2>
        <div className="card p-4">
          {stats.categoryStats.length > 0 && stats.totalActivities > 0 ? (
            <div className="space-y-3">
              {stats.categoryStats.map(({ category, count }) => {
                const cat = ACTIVITY_CATEGORIES[category as keyof typeof ACTIVITY_CATEGORIES]
                const pct = Math.round((count / stats.totalActivities) * 100)
                return (
                  <div key={category} className="flex items-center gap-3">
                    <span className="text-lg w-8">{cat.emoji}</span>
                    <span className="text-sm text-gray-600 w-16">{cat.label}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.bgColor.replace('100', '400')} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{count}场</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm">暂无活动数据</div>
            </div>
          )}
        </div>
      </div>

      {/* 出勤 TOP 3 */}
      {stats.leaderboard.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">出勤 TOP 3</h2>
          <div className="card p-4 space-y-3">
            {stats.leaderboard.map((stat, index) => {
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={stat.familyId} className="flex items-center gap-3">
                  <span className="text-xl">{medals[index]}</span>
                  <span className="text-sm font-medium text-gray-700 flex-1">{stat.familyName}</span>
                  <span className="text-sm text-gray-500">{stat.attended}/{stat.totalActivities}次</span>
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                    {stat.rate}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
