import { useMemo } from 'react'
import { useAppStore } from '@/store'
import { calcLeaderboard } from '@/utils/deriveStats'

export default function LeaderboardPage() {
  const data = useAppStore(s => s.data)

  const leaderboard = useMemo(() => {
    return calcLeaderboard(data.families, data.activities, data.checkIns)
  }, [data.families, data.activities, data.checkIns])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="page-container space-y-5">
      <div className="text-center">
        <h1 className="page-title">📊 出勤排行榜</h1>
        <p className="text-sm text-gray-500 mt-1">
          一起探索、一起成长！
        </p>
      </div>

      {leaderboard.length > 0 ? (
        <div className="space-y-2">
          {leaderboard.map((item, index) => {
            const family = data.families.find(f => f.id === item.familyId)
            return (
              <div
                key={item.familyId}
                className={`card flex items-center gap-3 p-4 animate-fade-in ${
                  index < 3 ? 'ring-2 ring-primary-100' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* 排名 */}
                <div className="w-8 text-center flex-shrink-0">
                  {index < 3 ? (
                    <span className="text-2xl">{medals[index]}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                  )}
                </div>

                {/* 头像 */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-warm-300
                                flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                  {family?.name?.charAt(0) || '?'}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.familyName}</p>
                  <p className="text-[10px] text-gray-400">
                    参加 {item.attended}/{item.totalActivities} 次活动
                  </p>
                </div>

                {/* 出勤率 */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-primary-600">{item.rate}%</p>
                  <p className="text-[10px] text-gray-400">出勤率</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏃‍♂️</p>
          <p className="text-sm">暂无出勤数据</p>
          <p className="text-xs mt-1">参加活动后排行榜会更新哦</p>
        </div>
      )}
    </div>
  )
}
