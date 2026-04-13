// ============================================
// 管理后台 - 活动管理
// ============================================

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useAuthStore } from '@/store'
import { ACTIVITY_CATEGORIES } from '@/lib/constants'
import { formatDate, formatWeekday } from '@/utils/dateUtils'
import type { ActivityCategory, ActivityStatus } from '@/types'

export default function ActivityManage() {
  const navigate = useNavigate()
  const data = useAppStore(s => s.data)
  const activeChapter = useAppStore(s => s.activeChapter)
  const addActivity = useAppStore(s => s.addActivity)
  const updateActivity = useAppStore(s => s.updateActivity)
  const deleteActivity = useAppStore(s => s.deleteActivity)
  const checkIn = useAppStore(s => s.checkIn)
  const undoCheckIn = useAppStore(s => s.undoCheckIn)
  const isSuperAdmin = useAuthStore(s => s.isSuperAdmin)

  // --- 状态 ---
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showCheckIn, setShowCheckIn] = useState<string | null>(null) // 展示签到管理的活动ID
  const [filter, setFilter] = useState<'all' | 'planned' | 'completed' | 'cancelled'>('all')

  // 表单状态
  const [formDate, setFormDate] = useState('')
  const [formCategory, setFormCategory] = useState<ActivityCategory>('outdoor')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formHost, setFormHost] = useState('')
  const [formStatus, setFormStatus] = useState<ActivityStatus>('planned')

  // --- 活动列表 ---
  const activities = useMemo(() => {
    let list = activeChapter
      ? data.activities.filter(a => a.chapterId === activeChapter.id)
      : data.activities

    if (filter !== 'all') {
      list = list.filter(a => a.status === filter)
    }

    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [data.activities, activeChapter, filter])

  // --- 可作为轮值主持的家庭列表 ---
  const familyOptions = useMemo(
    () => data.families.filter(f => f.role !== 'superadmin'),
    [data.families]
  )

  // --- 表单操作 ---
  const resetForm = () => {
    setFormDate('')
    setFormCategory('outdoor')
    setFormTitle('')
    setFormDesc('')
    setFormHost('')
    setFormStatus('planned')
    setEditingId(null)
    setShowForm(false)
  }

  const openCreateForm = () => {
    resetForm()
    if (familyOptions.length > 0) {
      setFormHost(familyOptions[0].id)
    }
    setShowForm(true)
  }

  const openEditForm = (activityId: string) => {
    const activity = data.activities.find(a => a.id === activityId)
    if (!activity) return
    setFormDate(activity.date)
    setFormCategory(activity.category)
    setFormTitle(activity.title)
    setFormDesc(activity.description)
    setFormHost(activity.hostFamilyId)
    setFormStatus(activity.status)
    setEditingId(activityId)
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!formDate || !formTitle.trim() || !activeChapter) return

    if (editingId) {
      updateActivity(editingId, {
        date: formDate,
        category: formCategory,
        title: formTitle.trim(),
        description: formDesc.trim(),
        hostFamilyId: formHost,
        status: formStatus,
      })
    } else {
      addActivity({
        chapterId: activeChapter.id,
        date: formDate,
        category: formCategory,
        title: formTitle.trim(),
        description: formDesc.trim(),
        hostFamilyId: formHost,
        status: 'planned',
      })
    }
    resetForm()
  }

  const handleDelete = (activityId: string) => {
    if (confirmDelete === activityId) {
      deleteActivity(activityId)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(activityId)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  // --- 签到管理 ---
  const getCheckInsForActivity = (activityId: string) => {
    return data.checkIns.filter(c => c.activityId === activityId)
  }

  const toggleCheckIn = (activityId: string, familyId: string) => {
    const isChecked = data.checkIns.some(
      c => c.activityId === activityId && c.familyId === familyId
    )
    if (isChecked) {
      undoCheckIn(activityId, familyId)
    } else {
      checkIn(activityId, familyId, 'admin')
    }
  }

  // --- 状态标签 ---
  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'planned': return { text: '待进行', color: 'bg-sky-100 text-sky-600' }
      case 'completed': return { text: '已完成', color: 'bg-mint-100 text-mint-600' }
      case 'cancelled': return { text: '已取消', color: 'bg-gray-100 text-gray-500' }
    }
  }

  return (
    <div className="page-container pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
          ← 返回
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">活动管理</h1>
        <button
          onClick={openCreateForm}
          disabled={!activeChapter}
          className="btn-primary text-sm px-4 py-2 disabled:opacity-40"
        >
          + 创建活动
        </button>
      </div>

      {/* 未设置章节提示 */}
      {!activeChapter && (
        <div className="card p-6 text-center mb-6">
          <div className="text-3xl mb-2">📖</div>
          <div className="text-gray-600 font-medium">请先创建一个章节</div>
          <div className="text-gray-400 text-sm mt-1">活动需要归属于一个章节</div>
          <button
            onClick={() => navigate('/admin/chapters')}
            className="btn-primary mt-4 text-sm px-6 py-2"
          >
            去创建章节
          </button>
        </div>
      )}

      {/* 筛选标签 */}
      {activeChapter && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {[
            { key: 'all' as const, label: '全部' },
            { key: 'planned' as const, label: '待进行' },
            { key: 'completed' as const, label: '已完成' },
            { key: 'cancelled' as const, label: '已取消' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-sm px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* 活动列表 */}
      <div className="space-y-3">
        {activities.map(activity => {
          const cat = ACTIVITY_CATEGORIES[activity.category]
          const statusBadge = getStatusBadge(activity.status)
          const hostFamily = data.families.find(f => f.id === activity.hostFamilyId)
          const checkInCount = getCheckInsForActivity(activity.id).length
          const totalFamilies = data.families.filter(f => f.role !== 'superadmin').length

          return (
            <div key={activity.id} className="card p-4">
              {/* 活动基本信息 */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${cat.bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 truncate">{activity.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {formatDate(activity.date)} {formatWeekday(activity.date)}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    🏠 {hostFamily?.name || '未指定'} · ✅ {checkInCount}/{totalFamilies}签到
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/activity/${activity.id}`)}
                  className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 rounded-lg transition-colors"
                >
                  查看详情
                </button>
                <button
                  onClick={() => setShowCheckIn(showCheckIn === activity.id ? null : activity.id)}
                  className="flex-1 text-xs bg-mint-50 hover:bg-mint-100 text-mint-600 py-2 rounded-lg transition-colors"
                >
                  签到管理
                </button>
                <button
                  onClick={() => openEditForm(activity.id)}
                  className="flex-1 text-xs bg-sky-50 hover:bg-sky-100 text-sky-600 py-2 rounded-lg transition-colors"
                >
                  编辑
                </button>
                {isSuperAdmin() && (
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                      confirmDelete === activity.id
                        ? 'bg-red-500 text-white'
                        : 'bg-red-50 hover:bg-red-100 text-red-500'
                    }`}
                  >
                    {confirmDelete === activity.id ? '确认' : '删除'}
                  </button>
                )}
              </div>

              {/* 签到管理面板 */}
              {showCheckIn === activity.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-2">签到管理</div>
                  <div className="space-y-2">
                    {familyOptions.map(family => {
                      const isChecked = data.checkIns.some(
                        c => c.activityId === activity.id && c.familyId === family.id
                      )
                      return (
                        <div
                          key={family.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{family.avatarUrl || '🏠'}</span>
                            <span className="text-sm text-gray-700">{family.name}</span>
                          </div>
                          <button
                            onClick={() => toggleCheckIn(activity.id, family.id)}
                            className={`text-xs px-3 py-1 rounded-full transition-all ${
                              isChecked
                                ? 'bg-mint-500 text-white'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                            }`}
                          >
                            {isChecked ? '✓ 已签到' : '签到'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {activities.length === 0 && activeChapter && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <div>暂无活动</div>
            <button onClick={openCreateForm} className="btn-primary mt-4 text-sm px-6 py-2">
              创建第一场活动
            </button>
          </div>
        )}
      </div>

      {/* 创建/编辑活动弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? '编辑活动' : '创建新活动'}
            </h2>

            {/* 活动日期 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">活动日期 *</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* 活动分类 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">活动分类 *</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ACTIVITY_CATEGORIES) as ActivityCategory[]).map(cat => {
                  const config = ACTIVITY_CATEGORIES[cat]
                  return (
                    <button
                      key={cat}
                      onClick={() => setFormCategory(cat)}
                      className={`p-2 rounded-xl text-center transition-all text-sm ${
                        formCategory === cat
                          ? `${config.bgColor} ${config.textColor} ring-2 ring-offset-1`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      style={formCategory === cat ? { '--tw-ring-color': config.textColor } as React.CSSProperties : {}}
                    >
                      <div className="text-lg">{config.emoji}</div>
                      <div className="text-xs mt-0.5">{config.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 活动标题 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">活动标题 *</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="给活动起个名字吧"
                className="input-field"
                maxLength={30}
              />
            </div>

            {/* 活动描述 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">活动描述</label>
              <textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="描述一下活动内容、地点、需要准备的东西..."
                className="input-field min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            {/* 轮值家庭 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">主持家庭</label>
              <select
                value={formHost}
                onChange={e => setFormHost(e.target.value)}
                className="input-field"
              >
                <option value="">未指定</option>
                {familyOptions.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* 状态（编辑时才可改）*/}
            {editingId && (
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">状态</label>
                <div className="flex gap-2">
                  {(['planned', 'completed', 'cancelled'] as ActivityStatus[]).map(status => {
                    const badge = getStatusBadge(status)
                    return (
                      <button
                        key={status}
                        onClick={() => setFormStatus(status)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          formStatus === status
                            ? 'bg-primary-500 text-white shadow-md'
                            : `${badge.color} hover:opacity-80`
                        }`}
                      >
                        {badge.text}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 按钮 */}
            <div className="flex gap-3">
              <button onClick={resetForm} className="btn-secondary flex-1">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formDate || !formTitle.trim()}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                {editingId ? '保存修改' : '创建活动'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
