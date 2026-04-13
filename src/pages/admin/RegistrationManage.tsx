// ============================================
// 管理后台 - 注册申请审批
// ============================================

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useAuthStore } from '@/store'
import type { Registration, RegistrationStatus } from '@/types'
import { Check, X, Clock, ChevronRight, Copy } from 'lucide-react'

export default function RegistrationManage() {
  const navigate = useNavigate()
  const data = useAppStore(s => s.data)
  const approveRegistration = useAppStore(s => s.approveRegistration)
  const rejectRegistration = useAppStore(s => s.rejectRegistration)
  const currentFamily = useAuthStore(s => s.currentFamily)

  // --- 状态 ---
  const [activeTab, setActiveTab] = useState<RegistrationStatus | 'all'>('pending')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approvedInfo, setApprovedInfo] = useState<{ familyName: string; password: string } | null>(null)
  const [customPassword, setCustomPassword] = useState('')
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // --- 筛选列表 ---
  const filteredRegistrations = useMemo(() => {
    const regs = [...data.registrations].sort(
      (a, b) => b.submittedAt.localeCompare(a.submittedAt)
    )
    if (activeTab === 'all') return regs
    return regs.filter(r => r.status === activeTab)
  }, [data.registrations, activeTab])

  const pendingCount = data.registrations.filter(r => r.status === 'pending').length

  // --- 操作 ---
  const handleApprove = (reg: Registration) => {
    if (!currentFamily) return

    if (approvingId === reg.id) {
      // 确认审批
      const pwd = customPassword.trim() || undefined
      const newFamily = approveRegistration(reg.id, currentFamily.id, pwd)
      if (newFamily) {
        setApprovedInfo({
          familyName: newFamily.name,
          password: newFamily.password,
        })
      }
      setApprovingId(null)
      setCustomPassword('')
    } else {
      // 进入审批确认
      setApprovingId(reg.id)
      setRejectingId(null)
    }
  }

  const handleReject = (regId: string) => {
    if (!currentFamily) return

    if (rejectingId === regId && rejectReason.trim()) {
      rejectRegistration(regId, currentFamily.id, rejectReason.trim())
      setRejectingId(null)
      setRejectReason('')
    } else {
      setRejectingId(regId)
      setApprovingId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // 降级方案
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
  }

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'pending': return { text: '待审核', color: 'bg-amber-100 text-amber-600', icon: <Clock className="w-3 h-3" /> }
      case 'approved': return { text: '已通过', color: 'bg-mint-100 text-mint-600', icon: <Check className="w-3 h-3" /> }
      case 'rejected': return { text: '已拒绝', color: 'bg-red-100 text-red-600', icon: <X className="w-3 h-3" /> }
    }
  }

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="page-container pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
          ← 返回
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">注册审批</h1>
        {pendingCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {pendingCount} 待审核
          </span>
        )}
      </div>

      {/* 邀请链接提示 */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-2">
          <span className="text-lg">🔗</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-primary-700">邀请链接</div>
            <div className="text-xs text-primary-500 mt-0.5 mb-2">
              将以下链接分享给想加入的家庭
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-primary-200 rounded-lg px-3 py-2 text-xs text-gray-600 truncate">
                {window.location.origin}/invite
              </code>
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/invite`)}
                className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { key: 'pending' as const, label: '待审核', count: pendingCount },
          { key: 'approved' as const, label: '已通过', count: data.registrations.filter(r => r.status === 'approved').length },
          { key: 'rejected' as const, label: '已拒绝', count: data.registrations.filter(r => r.status === 'rejected').length },
          { key: 'all' as const, label: '全部', count: data.registrations.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 ${activeTab === tab.key ? 'text-white/80' : 'text-gray-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 审批通过弹窗 */}
      {approvedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setApprovedInfo(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-mint-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-mint-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">审批通过！</h3>
              <p className="text-sm text-gray-500 mt-1">新家庭账号已创建</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">家庭名称</span>
                <span className="text-sm font-medium text-gray-800">{approvedInfo.familyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">登录密码</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    {approvedInfo.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(approvedInfo.password)}
                    className="text-gray-400 hover:text-primary-500"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-4">
              请将登录账号和密码告知对方
            </p>

            <button
              onClick={() => setApprovedInfo(null)}
              className="btn-primary w-full"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {/* 申请列表 */}
      <div className="space-y-3">
        {filteredRegistrations.map(reg => {
          const badge = getStatusBadge(reg.status)
          const isApproving = approvingId === reg.id
          const isRejecting = rejectingId === reg.id

          return (
            <div key={reg.id} className="card p-4">
              {/* 头部 */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center text-xl flex-shrink-0">
                  🏠
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 truncate">{reg.familyName}</span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.icon}
                      {badge.text}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatTime(reg.submittedAt)}</div>
                </div>
              </div>

              {/* 成员信息 */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-14 flex-shrink-0">成员</span>
                  <span className="text-gray-700">
                    {reg.members.map(m => {
                      let label = m.name || (m.type === 'parent' ? '家长' : '小朋友')
                      if (m.type === 'child' && m.age) label += `(${m.age}岁)`
                      return label
                    }).join('、')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-14 flex-shrink-0">联系方式</span>
                  <span className="text-gray-700">{reg.contactInfo}</span>
                </div>
                {reg.message && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400 w-14 flex-shrink-0">留言</span>
                    <span className="text-gray-700">{reg.message}</span>
                  </div>
                )}
              </div>

              {/* 审批区域（仅 pending 状态显示）*/}
              {reg.status === 'pending' && (
                <>
                  {/* 审批确认面板 */}
                  {isApproving && (
                    <div className="bg-mint-50 border border-mint-200 rounded-xl p-3 mb-3 animate-fade-in">
                      <div className="text-sm font-medium text-mint-700 mb-2">设置登录密码（可选）</div>
                      <input
                        type="text"
                        value={customPassword}
                        onChange={e => setCustomPassword(e.target.value)}
                        placeholder="留空则自动生成随机密码"
                        className="w-full bg-white border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-300"
                      />
                    </div>
                  )}

                  {/* 拒绝理由面板 */}
                  {isRejecting && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 animate-fade-in">
                      <div className="text-sm font-medium text-red-700 mb-2">拒绝原因</div>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="请输入拒绝原因"
                        className="w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    {(isApproving || isRejecting) && (
                      <button
                        onClick={() => { setApprovingId(null); setRejectingId(null); setRejectReason(''); setCustomPassword('') }}
                        className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl transition-colors"
                      >
                        取消
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(reg.id)}
                      disabled={isRejecting && !rejectReason.trim()}
                      className={`flex-1 text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 ${
                        isRejecting
                          ? 'bg-red-500 text-white disabled:opacity-40'
                          : 'bg-red-50 hover:bg-red-100 text-red-500'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      {isRejecting ? '确认拒绝' : '拒绝'}
                    </button>
                    <button
                      onClick={() => handleApprove(reg)}
                      className={`flex-1 text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 ${
                        isApproving
                          ? 'bg-mint-500 text-white'
                          : 'bg-mint-50 hover:bg-mint-100 text-mint-600'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {isApproving ? '确认通过' : '通过'}
                    </button>
                  </div>
                </>
              )}

              {/* 已处理信息 */}
              {reg.status === 'rejected' && reg.rejectReason && (
                <div className="bg-red-50 rounded-xl p-3 text-sm">
                  <span className="text-red-400">拒绝原因：</span>
                  <span className="text-red-600">{reg.rejectReason}</span>
                </div>
              )}

              {reg.status === 'approved' && reg.reviewedAt && (
                <div className="bg-mint-50 rounded-xl p-3 text-sm text-mint-600">
                  ✅ 已通过审核，账号已创建 · {formatTime(reg.reviewedAt)}
                </div>
              )}
            </div>
          )
        })}

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-sm">
              {activeTab === 'pending' ? '暂无待审核的申请' : '暂无申请记录'}
            </div>
            <p className="text-xs text-gray-300 mt-2">
              将邀请链接分享给其他家庭，他们注册后会出现在这里
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
