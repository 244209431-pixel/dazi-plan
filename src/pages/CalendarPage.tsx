import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import { ACTIVITY_CATEGORIES } from '@/lib/constants'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO, isSameMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const data = useAppStore(s => s.data)
  const navigate = useNavigate()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart) // 0=周日

  // 当月活动
  const monthActivities = useMemo(() => {
    return data.activities.filter(a => {
      const d = parseISO(a.date)
      return isSameMonth(d, currentMonth)
    }).sort((a, b) => a.date.localeCompare(b.date))
  }, [data.activities, currentMonth])

  const getActivityForDay = (day: Date) => {
    return data.activities.find(a => isSameDay(parseISO(a.date), day))
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="page-container space-y-4">
      {/* 月份选择器 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center
                     hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 font-display">
          {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center
                     hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 日历网格 */}
      <div className="card p-4">
        {/* 星期头 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* 日期格子 */}
        <div className="grid grid-cols-7 gap-1">
          {/* 填充月初空白 */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {days.map(day => {
            const activity = getActivityForDay(day)
            const isToday = isSameDay(day, new Date())
            const cat = activity ? ACTIVITY_CATEGORIES[activity.category] : null

            return (
              <button
                key={day.toISOString()}
                onClick={() => activity && navigate(`/activity/${activity.id}`)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center
                  text-xs transition-all duration-200 relative
                  ${isToday ? 'bg-primary-50 font-bold text-primary-600 ring-2 ring-primary-200' : ''}
                  ${activity ? 'hover:bg-gray-50 cursor-pointer' : 'text-gray-600'}
                `}
              >
                <span>{format(day, 'd')}</span>
                {activity && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    activity.status === 'completed' ? 'bg-mint-500' :
                    activity.status === 'cancelled' ? 'bg-gray-300' :
                    'bg-primary-400'
                  }`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-4 justify-center text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary-400" /> 计划中
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-mint-500" /> 已完成
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-300" /> 已取消
        </span>
      </div>

      {/* 当月活动列表 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          本月活动 ({monthActivities.length})
        </h3>
        {monthActivities.length > 0 ? (
          <div className="space-y-2">
            {monthActivities.map(activity => {
              const cat = ACTIVITY_CATEGORIES[activity.category]
              const host = data.families.find(f => f.id === activity.hostFamilyId)
              return (
                <button
                  key={activity.id}
                  onClick={() => navigate(`/activity/${activity.id}`)}
                  className="w-full card-float flex items-center gap-3 p-3 text-left"
                >
                  <div className={`w-11 h-11 rounded-xl ${cat?.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>
                    {cat?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400">{activity.date}</span>
                      {host && <span className="text-[11px] text-gray-400">· {host.name} 轮值</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    activity.status === 'completed' ? 'bg-mint-100 text-mint-700' :
                    activity.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                    'bg-primary-100 text-primary-700'
                  }`}>
                    {activity.status === 'completed' ? '已完成' :
                     activity.status === 'cancelled' ? '已取消' : '计划中'}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">本月暂无活动安排</p>
          </div>
        )}
      </div>
    </div>
  )
}
