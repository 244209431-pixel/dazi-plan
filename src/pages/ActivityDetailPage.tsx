import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '@/store'
import { ACTIVITY_CATEGORIES } from '@/lib/constants'
import { formatDate, formatDateTime } from '@/utils/dateUtils'
import type { VoteOption } from '@/types'
import {
  ArrowLeft, Check, Clock, Users, MessageCircle,
  Camera, Vote as VoteIcon, Send, Image, X, Plus, Trash2, BarChart3
} from 'lucide-react'

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentFamily = useAuthStore(s => s.currentFamily)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const data = useAppStore(s => s.data)
  const { checkIn, undoCheckIn, isCheckedIn, addComment, updateActivity, addVote, submitVote, getVoteByActivity, getVoteResults } = useAppStore()

  const [commentText, setCommentText] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'comments' | 'photos' | 'vote'>('info')
  
  // 投票创建状态
  const [showCreateVote, setShowCreateVote] = useState(false)
  const [voteTitle, setVoteTitle] = useState('')
  const [voteOptions, setVoteOptions] = useState<string[]>(['', ''])
  const [voteDays, setVoteDays] = useState(3) // 投票持续天数

  const activity = data.activities.find(a => a.id === id)
  if (!activity) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-gray-500">活动不存在</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">返回</button>
      </div>
    )
  }

  const cat = ACTIVITY_CATEGORIES[activity.category]
  const host = data.families.find(f => f.id === activity.hostFamilyId)
  const familyCheckedIn = currentFamily ? isCheckedIn(activity.id, currentFamily.id) : false
  const checkedInFamilies = data.checkIns
    .filter(c => c.activityId === activity.id)
    .map(c => ({
      ...c,
      family: data.families.find(f => f.id === c.familyId),
    }))
  const comments = data.comments
    .filter(c => c.activityId === activity.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const photos = data.photos.filter(p => p.activityId === activity.id)

  // 投票相关数据
  const existingVote = data.votes.find(v => v.activityId === activity.id)
  const voteRecords = existingVote
    ? data.voteRecords.filter(r => r.voteId === existingVote.id)
    : []
  const hasVoted = existingVote && currentFamily
    ? voteRecords.some(r => r.familyId === currentFamily.id)
    : false
  const myVoteRecord = existingVote && currentFamily
    ? voteRecords.find(r => r.familyId === currentFamily.id)
    : null
  const totalVotes = voteRecords.length
  const canCreateVote = currentFamily && (isAdmin() || currentFamily.id === activity.hostFamilyId)

  const handleCheckIn = () => {
    if (!currentFamily) return
    if (familyCheckedIn) {
      undoCheckIn(activity.id, currentFamily.id)
    } else {
      checkIn(activity.id, currentFamily.id, 'self')
    }
  }

  const handleComment = () => {
    if (!currentFamily || !commentText.trim()) return
    addComment({
      activityId: activity.id,
      familyId: currentFamily.id,
      content: commentText.trim(),
    })
    setCommentText('')
  }

  const handleComplete = () => {
    updateActivity(activity.id, { status: 'completed' })
  }

  // --- 投票操作 ---
  const handleCreateVote = () => {
    if (!currentFamily || !voteTitle.trim()) return
    const validOptions = voteOptions.filter(o => o.trim())
    if (validOptions.length < 2) return

    const deadline = new Date()
    deadline.setDate(deadline.getDate() + voteDays)

    addVote({
      activityId: activity.id,
      title: voteTitle.trim(),
      options: validOptions.map((text, index) => ({ index, text: text.trim() })),
      createdByFamilyId: currentFamily.id,
      deadline: deadline.toISOString(),
    })

    // 重置表单
    setVoteTitle('')
    setVoteOptions(['', ''])
    setShowCreateVote(false)
  }

  const handleSubmitVote = (optionIndex: number) => {
    if (!currentFamily || !existingVote || hasVoted) return
    submitVote(existingVote.id, currentFamily.id, optionIndex)
  }

  const addVoteOption = () => {
    if (voteOptions.length < 6) {
      setVoteOptions([...voteOptions, ''])
    }
  }

  const removeVoteOption = (index: number) => {
    if (voteOptions.length > 2) {
      setVoteOptions(voteOptions.filter((_, i) => i !== index))
    }
  }

  const updateVoteOption = (index: number, value: string) => {
    const newOptions = [...voteOptions]
    newOptions[index] = value
    setVoteOptions(newOptions)
  }

  const tabs = [
    { key: 'info', label: '详情', icon: '📋' },
    { key: 'vote', label: `投票${existingVote ? ` (${totalVotes})` : ''}`, icon: '🗳️' },
    { key: 'comments', label: `留言 (${comments.length})`, icon: '💬' },
    { key: 'photos', label: `照片 (${photos.length})`, icon: '📸' },
  ] as const

  return (
    <div className="min-h-screen bg-warm-50">
      {/* 顶部横幅 */}
      <div className={`relative bg-gradient-to-br ${
        cat?.color === 'mint' ? 'from-mint-400 to-mint-500' :
        cat?.color === 'lavender' ? 'from-lavender-400 to-lavender-500' :
        cat?.color === 'sky' ? 'from-sky-400 to-sky-500' :
        cat?.color === 'rose' ? 'from-rose-400 to-rose-500' :
        'from-primary-400 to-warm-400'
      } pb-6 pt-4 px-4 text-white`}>
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-3
                     hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="max-w-lg mx-auto">
          <span className="text-3xl">{cat?.emoji}</span>
          <h1 className="text-xl font-bold mt-2">{activity.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {activity.date}
            </span>
            {host && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {host.name} 轮值
              </span>
            )}
          </div>
          <span className="inline-block mt-2 px-3 py-0.5 bg-white/20 rounded-full text-xs">
            {cat?.label}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-3 pb-24 space-y-4">
        {/* 签到区 */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              ✅ 签到 ({checkedInFamilies.length}/{data.families.length})
            </h3>
            {isAdmin() && activity.status === 'planned' && (
              <button onClick={handleComplete} className="text-xs text-mint-600 font-medium">
                标记完成
              </button>
            )}
          </div>

          {/* 签到按钮 */}
          <button
            onClick={handleCheckIn}
            disabled={activity.status === 'cancelled'}
            className={`w-full py-3 rounded-2xl font-medium text-sm transition-all duration-300 mb-3 ${
              familyCheckedIn
                ? 'bg-mint-100 text-mint-700 border-2 border-mint-200'
                : 'bg-primary-500 text-white shadow-glow animate-pulse-glow'
            }`}
          >
            {familyCheckedIn ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> 已签到 ✨
              </span>
            ) : (
              '点击签到 🎉'
            )}
          </button>

          {/* 签到列表 */}
          {checkedInFamilies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {checkedInFamilies.map(c => (
                <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-mint-50 rounded-full text-xs text-mint-700">
                  <Check className="w-3 h-3" />
                  {c.family?.name || '未知'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tab 切换 */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        {activeTab === 'info' && (
          <div className="card animate-fade-in">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">活动详情</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {activity.description || '暂无详细描述'}
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-500">活动类型</div>
                <div className="font-medium">{cat?.emoji} {cat?.label}</div>
                <div className="text-gray-500">活动日期</div>
                <div className="font-medium">{activity.date}</div>
                <div className="text-gray-500">轮值家庭</div>
                <div className="font-medium">{host?.name || '-'}</div>
                <div className="text-gray-500">状态</div>
                <div className="font-medium">
                  {activity.status === 'completed' ? '✅ 已完成' :
                   activity.status === 'cancelled' ? '❌ 已取消' : '📋 计划中'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 投票 Tab ===== */}
        {activeTab === 'vote' && (
          <div className="space-y-3 animate-fade-in">
            {existingVote ? (
              <>
                {/* 投票卡片 */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🗳️</span>
                    <h3 className="text-sm font-semibold text-gray-900 flex-1">{existingVote.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full font-medium">
                      {totalVotes} 人已投
                    </span>
                  </div>

                  {/* 截止时间 */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>
                      截止：{formatDateTime(existingVote.deadline)}
                      {new Date(existingVote.deadline) < new Date() && (
                        <span className="ml-1 text-rose-500 font-medium">（已结束）</span>
                      )}
                    </span>
                  </div>

                  {/* 选项列表 */}
                  <div className="space-y-2">
                    {existingVote.options.map(opt => {
                      const optCount = voteRecords.filter(r => r.optionIndex === opt.index).length
                      const percent = totalVotes > 0 ? Math.round(optCount / totalVotes * 100) : 0
                      const isMyChoice = myVoteRecord?.optionIndex === opt.index
                      const isExpired = new Date(existingVote.deadline) < new Date()
                      const canVote = currentFamily && !hasVoted && !isExpired

                      // 已投票或已过期 → 显示结果
                      if (hasVoted || isExpired) {
                        return (
                          <div
                            key={opt.index}
                            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                              isMyChoice
                                ? 'border-primary-300 bg-primary-50'
                                : 'border-gray-100 bg-gray-50'
                            }`}
                          >
                            {/* 进度条背景 */}
                            <div
                              className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                                isMyChoice ? 'bg-primary-100' : 'bg-gray-100'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                            <div className="relative flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-2">
                                {isMyChoice && (
                                  <span className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                                <span className={`text-sm ${isMyChoice ? 'font-semibold text-primary-700' : 'text-gray-700'}`}>
                                  {opt.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isMyChoice ? 'text-primary-600' : 'text-gray-500'}`}>
                                  {percent}%
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({optCount}票)
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      // 未投票 → 可点击
                      return (
                        <button
                          key={opt.index}
                          onClick={() => handleSubmitVote(opt.index)}
                          disabled={!canVote}
                          className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200
                                     hover:border-primary-300 hover:bg-primary-50
                                     active:scale-[0.98] transition-all duration-200
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-sm text-gray-700">{opt.text}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* 投票者列表 */}
                  {voteRecords.length > 0 && (hasVoted || new Date(existingVote.deadline) < new Date()) && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[11px] text-gray-400 mb-2">投票详情</p>
                      <div className="flex flex-wrap gap-1.5">
                        {voteRecords.map(r => {
                          const family = data.families.find(f => f.id === r.familyId)
                          const opt = existingVote.options.find(o => o.index === r.optionIndex)
                          return (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-[10px] text-gray-600"
                            >
                              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-300 to-warm-300
                                              flex items-center justify-center text-white text-[8px] font-medium">
                                {family?.name?.charAt(0) || '?'}
                              </span>
                              {family?.name || '未知'} → {opt?.text || '?'}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 创建者信息 */}
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span>由 {data.families.find(f => f.id === existingVote.createdByFamilyId)?.name || '未知'} 发起</span>
                    <span>·</span>
                    <span>{formatDateTime(existingVote.createdAt)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 无投票时的空状态 */}
                {!showCreateVote && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">🗳️</p>
                    <p className="text-sm mb-4">暂无投票</p>
                    {canCreateVote && (
                      <button
                        onClick={() => setShowCreateVote(true)}
                        className="btn-primary text-sm px-6"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        发起投票
                      </button>
                    )}
                  </div>
                )}

                {/* 创建投票表单 */}
                {showCreateVote && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">🗳️ 发起投票</h3>
                      <button
                        onClick={() => setShowCreateVote(false)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* 投票标题 */}
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1.5">投票标题</label>
                      <input
                        type="text"
                        value={voteTitle}
                        onChange={e => setVoteTitle(e.target.value)}
                        placeholder="例如：下次聚餐去哪里？"
                        className="input-field text-sm"
                        maxLength={50}
                      />
                    </div>

                    {/* 投票选项 */}
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1.5">
                        投票选项 ({voteOptions.length}/6)
                      </label>
                      <div className="space-y-2">
                        {voteOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateVoteOption(idx, e.target.value)}
                              placeholder={`选项 ${String.fromCharCode(65 + idx)}`}
                              className="input-field text-sm flex-1"
                              maxLength={30}
                            />
                            {voteOptions.length > 2 && (
                              <button
                                onClick={() => removeVoteOption(idx)}
                                className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center
                                           hover:bg-rose-100 transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {voteOptions.length < 6 && (
                        <button
                          onClick={addVoteOption}
                          className="mt-2 text-xs text-primary-500 font-medium flex items-center gap-1
                                     hover:text-primary-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> 添加选项
                        </button>
                      )}
                    </div>

                    {/* 投票时长 */}
                    <div className="mb-5">
                      <label className="block text-xs text-gray-500 mb-1.5">投票时长</label>
                      <div className="flex gap-2">
                        {[1, 3, 5, 7].map(d => (
                          <button
                            key={d}
                            onClick={() => setVoteDays(d)}
                            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                              voteDays === d
                                ? 'bg-primary-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {d}天
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 提交按钮 */}
                    <button
                      onClick={handleCreateVote}
                      disabled={!voteTitle.trim() || voteOptions.filter(o => o.trim()).length < 2}
                      className="w-full btn-primary py-3 text-sm disabled:opacity-40"
                    >
                      发起投票 🎉
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-3 animate-fade-in">
            {/* 留言输入 */}
            <div className="card flex items-end gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="写下你的感想..."
                className="input-field flex-1 text-sm py-2"
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center
                           disabled:opacity-30 hover:bg-primary-600 transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* 留言列表 */}
            {comments.length > 0 ? (
              comments.map(c => {
                const family = data.families.find(f => f.id === c.familyId)
                return (
                  <div key={c.id} className="card p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-300 to-warm-300
                                      flex items-center justify-center text-white text-xs font-medium">
                        {family?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{family?.name || '未知'}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 pl-9">{c.content}</p>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm">还没有留言，第一个留言吧！</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="animate-fade-in">
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map(p => (
                  <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm">还没有照片，快来上传吧！</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
