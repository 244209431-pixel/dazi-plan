import { useMemo } from 'react'
import { useAuthStore, useAppStore } from '@/store'
import { calcFamilyBadges } from '@/utils/deriveStats'
import { ACTIVITY_CATEGORIES, MILESTONE_LABELS, MILESTONES } from '@/lib/constants'
import type { ActivityCategory } from '@/types'

export default function BadgesPage() {
  const currentFamily = useAuthStore(s => s.currentFamily)
  const data = useAppStore(s => s.data)

  const badges = useMemo(() => {
    if (!currentFamily) return null
    return calcFamilyBadges(
      currentFamily.id, data.activities, data.checkIns, data.manualBadges
    )
  }, [currentFamily, data.activities, data.checkIns, data.manualBadges])

  if (!badges) return null

  const totalPossible = 5 + MILESTONES.length
  const totalAttended = new Set(
    data.checkIns.filter(c => c.familyId === currentFamily?.id).map(c => c.activityId)
  ).size

  return (
    <div className="page-container space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="page-title">🏆 勋章墙</h1>
        <p className="text-sm text-gray-500 mt-1">
          已获得 {badges.totalUnlocked} / {totalPossible + badges.specialBadges.length} 枚勋章
        </p>
      </div>

      {/* 探索勋章 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
          <span className="text-lg">🗺️</span> 探索勋章
          <span className="text-xs text-gray-400 font-normal ml-1">
            参加对应类型活动即可获得
          </span>
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {badges.exploreBadges.map(badge => {
            const cat = ACTIVITY_CATEGORIES[badge.category]
            return (
              <div
                key={badge.category}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 ${
                  badge.unlocked
                    ? 'bg-white shadow-card scale-105'
                    : 'bg-gray-100/50 opacity-50 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  badge.unlocked ? `${cat.bgColor} shadow-sm` : 'bg-gray-200'
                }`}>
                  {cat.emoji}
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight ${
                  badge.unlocked ? cat.textColor : 'text-gray-400'
                }`}>
                  {cat.label}
                </span>
                {badge.unlocked && (
                  <span className="text-[8px] text-mint-500">✓ 已获得</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 里程碑勋章 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
          <span className="text-lg">🎯</span> 里程碑勋章
          <span className="text-xs text-gray-400 font-normal ml-1">
            累计参加活动次数解锁
          </span>
        </h3>
        <div className="card p-4">
          {/* 进度条 */}
          <div className="relative">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-warm-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (totalAttended / 20) * 100)}%` }}
              />
            </div>
            {/* 里程碑节点 */}
            <div className="flex justify-between mt-4">
              {badges.milestoneBadges.map(badge => {
                const config = MILESTONE_LABELS[badge.milestone]
                return (
                  <div
                    key={badge.milestone}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                      badge.unlocked ? 'scale-110' : 'opacity-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      badge.unlocked
                        ? 'bg-primary-100 shadow-sm'
                        : 'bg-gray-100'
                    }`}>
                      {config?.emoji}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600">
                      {config?.label}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {badge.milestone}次
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            已参加 <span className="font-bold text-primary-600">{totalAttended}</span> 次活动
          </p>
        </div>
      </div>

      {/* 特别勋章 */}
      {badges.specialBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <span className="text-lg">👑</span> 特别勋章
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.specialBadges.map(badge => (
              <div key={badge.id} className="card p-3 border-2 border-primary-100">
                <p className="text-lg mb-1">🏅</p>
                <p className="text-sm font-semibold text-gray-900">{badge.badgeName}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {badge.grantedAt?.slice(0, 10)} 颁发
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空特别勋章 */}
      {badges.specialBadges.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-2xl mb-1">✨</p>
          <p className="text-xs">特别勋章由超管在章节结束时颁发</p>
        </div>
      )}
    </div>
  )
}
