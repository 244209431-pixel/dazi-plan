// ============================================
// 管理后台 - 章节管理
// ============================================

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useAuthStore } from '@/store'
import { CHAPTER_THEMES, APP_CONFIG } from '@/lib/constants'
import { formatDate, getChapterDateRange, generateActivityDates } from '@/utils/dateUtils'
import { addMonths, format, parseISO } from 'date-fns'

export default function ChapterManage() {
  const navigate = useNavigate()
  const data = useAppStore(s => s.data)
  const activeChapter = useAppStore(s => s.activeChapter)
  const addChapter = useAppStore(s => s.addChapter)
  const endChapter = useAppStore(s => s.endChapter)
  const isSuperAdmin = useAuthStore(s => s.isSuperAdmin)

  // --- 状态 ---
  const [showCreate, setShowCreate] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(0)
  const [customTitle, setCustomTitle] = useState('')
  const [customSubtitle, setCustomSubtitle] = useState('')
  const [startDate, setStartDate] = useState('')

  // --- 章节列表 ---
  const chapters = useMemo(() => {
    return [...data.chapters].sort((a, b) => b.startDate.localeCompare(a.startDate))
  }, [data.chapters])

  // --- 推算下一章节号 ---
  const nextChapterIndex = data.chapters.length

  // --- 推荐开始日期 ---
  const suggestedStartDate = useMemo(() => {
    if (data.chapters.length === 0) return APP_CONFIG.firstChapterStart
    const lastChapter = [...data.chapters].sort((a, b) => b.endDate.localeCompare(a.endDate))[0]
    if (lastChapter) {
      // 上一章结束日期后一天
      const nextDate = new Date(lastChapter.endDate)
      nextDate.setDate(nextDate.getDate() + 1)
      return format(nextDate, 'yyyy-MM-dd')
    }
    return APP_CONFIG.firstChapterStart
  }, [data.chapters])

  // --- 打开创建表单 ---
  const openCreateForm = () => {
    const themeIdx = nextChapterIndex < CHAPTER_THEMES.length ? nextChapterIndex : nextChapterIndex % CHAPTER_THEMES.length
    setSelectedTheme(themeIdx)
    setCustomTitle(CHAPTER_THEMES[themeIdx].title)
    setCustomSubtitle(CHAPTER_THEMES[themeIdx].subtitle)
    setStartDate(suggestedStartDate)
    setShowCreate(true)
  }

  // --- 创建章节 ---
  const handleCreate = () => {
    if (!startDate) return

    const endDate = format(
      addMonths(parseISO(startDate), APP_CONFIG.chapterDurationMonths),
      'yyyy-MM-dd'
    )

    addChapter({
      title: customTitle || CHAPTER_THEMES[selectedTheme].title,
      subtitle: customSubtitle || CHAPTER_THEMES[selectedTheme].subtitle,
      startDate,
      endDate,
      isActive: true,
    })

    setShowCreate(false)
  }

  // --- 结束章节 ---
  const handleEndChapter = () => {
    if (activeChapter && confirmEnd) {
      endChapter(activeChapter.id)
      setConfirmEnd(false)
    } else {
      setConfirmEnd(true)
      setTimeout(() => setConfirmEnd(false), 3000)
    }
  }

  // --- 计算章节的活动统计 ---
  const getChapterStats = (chapterId: string) => {
    const chapterActivities = data.activities.filter(a => a.chapterId === chapterId)
    const completed = chapterActivities.filter(a => a.status === 'completed').length
    const planned = chapterActivities.filter(a => a.status === 'planned').length
    const totalCheckIns = data.checkIns.filter(
      c => chapterActivities.some(a => a.id === c.activityId)
    ).length

    return { total: chapterActivities.length, completed, planned, totalCheckIns }
  }

  // --- 预览活动日期 ---
  const previewDates = useMemo(() => {
    if (!startDate) return []
    const endDate = format(
      addMonths(parseISO(startDate), APP_CONFIG.chapterDurationMonths),
      'yyyy-MM-dd'
    )
    return generateActivityDates(startDate, endDate, APP_CONFIG.activityIntervalWeeks)
  }, [startDate])

  return (
    <div className="page-container pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
          ← 返回
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">章节管理</h1>
        {isSuperAdmin() && !activeChapter && (
          <button onClick={openCreateForm} className="btn-primary text-sm px-4 py-2">
            + 新建章节
          </button>
        )}
      </div>

      {/* 当前活跃章节 */}
      {activeChapter ? (
        <div className="bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-2xl p-5 text-white mb-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-white/80 text-xs">当前活跃章节</div>
              <div className="text-2xl font-bold mt-1">
                {CHAPTER_THEMES.find(t => t.title === activeChapter.title)?.emoji || '📖'}{' '}
                {activeChapter.title} · {activeChapter.subtitle}
              </div>
            </div>
            <div className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              进行中
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/70 text-xs">开始日期</div>
              <div className="font-medium">{formatDate(activeChapter.startDate, 'yyyy年MM月dd日')}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/70 text-xs">结束日期</div>
              <div className="font-medium">{formatDate(activeChapter.endDate, 'yyyy年MM月dd日')}</div>
            </div>
          </div>

          {/* 章节统计 */}
          {(() => {
            const stats = getChapterStats(activeChapter.id)
            return (
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{stats.total}</div>
                  <div className="text-xs text-white/70">总活动</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{stats.completed}</div>
                  <div className="text-xs text-white/70">已完成</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{stats.planned}</div>
                  <div className="text-xs text-white/70">待进行</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{stats.totalCheckIns}</div>
                  <div className="text-xs text-white/70">签到数</div>
                </div>
              </div>
            )
          })()}

          {/* 操作按钮 */}
          {isSuperAdmin() && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin/activities')}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl text-sm transition-colors"
              >
                管理活动
              </button>
              <button
                onClick={handleEndChapter}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  confirmEnd
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {confirmEnd ? '确认结束' : '结束章节'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center mb-6">
          <div className="text-4xl mb-3">📖</div>
          <div className="text-gray-600 font-medium text-lg">还没有活跃的章节</div>
          <div className="text-gray-400 text-sm mt-1">创建一个新章节，开始你们的搭子旅程吧！</div>
          {isSuperAdmin() && (
            <button onClick={openCreateForm} className="btn-primary mt-4 px-6 py-2.5">
              🚀 创建新章节
            </button>
          )}
        </div>
      )}

      {/* 历史章节 */}
      {chapters.filter(c => !c.isActive).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">历史章节</h2>
          <div className="space-y-3">
            {chapters
              .filter(c => !c.isActive)
              .map(chapter => {
                const stats = getChapterStats(chapter.id)
                const theme = CHAPTER_THEMES.find(t => t.title === chapter.title)
                return (
                  <div key={chapter.id} className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{theme?.emoji || '📖'}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">
                          {chapter.title} · {chapter.subtitle}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {formatDate(chapter.startDate, 'yyyy.MM.dd')} - {formatDate(chapter.endDate, 'yyyy.MM.dd')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-700">{stats.completed}场</div>
                        <div className="text-xs text-gray-400">{stats.totalCheckIns}次签到</div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* 创建章节弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🚀 创建新章节</h2>

            {/* 主题选择 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">选择主题</label>
              <div className="grid grid-cols-4 gap-2">
                {CHAPTER_THEMES.map((theme, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTheme(idx)
                      setCustomTitle(theme.title)
                      setCustomSubtitle(theme.subtitle)
                    }}
                    className={`p-2 rounded-xl text-center transition-all ${
                      selectedTheme === idx
                        ? 'bg-lavender-100 ring-2 ring-lavender-400 scale-105'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xl">{theme.emoji}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{theme.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 标题 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">章节标题</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="第X章"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">副标题</label>
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={e => setCustomSubtitle(e.target.value)}
                  placeholder="夏日篇"
                  className="input-field"
                />
              </div>
            </div>

            {/* 开始日期 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="input-field"
              />
              <div className="text-xs text-gray-400 mt-1">
                持续 {APP_CONFIG.chapterDurationMonths} 个月，预计结束：
                {startDate && formatDate(
                  format(addMonths(parseISO(startDate), APP_CONFIG.chapterDurationMonths), 'yyyy-MM-dd'),
                  'yyyy年MM月dd日'
                )}
              </div>
            </div>

            {/* 预览活动日期 */}
            {previewDates.length > 0 && (
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">
                  预计活动日期（每两周一次，周日）
                </label>
                <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1.5">
                    {previewDates.map((date, idx) => (
                      <div key={date} className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        {formatDate(date, 'MM月dd日')}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  共 {previewDates.length} 场活动
                </div>
              </div>
            )}

            {/* 按钮 */}
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!startDate}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                创建章节 🎉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
