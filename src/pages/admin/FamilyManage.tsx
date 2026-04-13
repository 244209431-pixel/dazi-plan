// ============================================
// 管理后台 - 家庭管理
// ============================================

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useAuthStore } from '@/store'
import { calcAttendance } from '@/utils/deriveStats'
import { DEFAULT_AVATARS } from '@/lib/constants'
import type { FamilyRole, FamilyMember } from '@/types'

export default function FamilyManage() {
  const navigate = useNavigate()
  const data = useAppStore(s => s.data)
  const addFamily = useAppStore(s => s.addFamily)
  const updateFamily = useAppStore(s => s.updateFamily)
  const deleteFamily = useAppStore(s => s.deleteFamily)
  const isSuperAdmin = useAuthStore(s => s.isSuperAdmin)
  const currentFamily = useAuthStore(s => s.currentFamily)

  // --- 状态 ---
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // 表单状态
  const [formName, setFormName] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<FamilyRole>('member')
  const [formAvatar, setFormAvatar] = useState('🏠')
  const [formMembers, setFormMembers] = useState<FamilyMember[]>([])

  // --- 家庭列表（排除超级管理员自身显示在最后）---
  const familyList = useMemo(() => {
    return [...data.families].sort((a, b) => {
      if (a.role === 'superadmin') return -1
      if (b.role === 'superadmin') return 1
      if (a.role === 'admin' && b.role !== 'admin') return -1
      if (b.role === 'admin' && a.role !== 'admin') return 1
      return a.createdAt.localeCompare(b.createdAt)
    })
  }, [data.families])

  // --- 表单操作 ---
  const resetForm = () => {
    setFormName('')
    setFormPassword('')
    setFormRole('member')
    setFormAvatar('🏠')
    setFormMembers([])
    setEditingId(null)
    setShowForm(false)
  }

  const openCreateForm = () => {
    resetForm()
    setFormPassword(generateDefaultPassword())
    setShowForm(true)
  }

  const openEditForm = (familyId: string) => {
    const family = data.families.find(f => f.id === familyId)
    if (!family) return
    setFormName(family.name)
    setFormPassword(family.password)
    setFormRole(family.role)
    setFormAvatar(family.avatarUrl || '🏠')
    setFormMembers([...family.members])
    setEditingId(familyId)
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!formName.trim()) return

    if (editingId) {
      // 更新家庭
      updateFamily(editingId, {
        name: formName.trim(),
        password: formPassword,
        role: formRole,
        avatarUrl: formAvatar,
        members: formMembers,
      })
    } else {
      // 创建新家庭
      addFamily({
        name: formName.trim(),
        password: formPassword || generateDefaultPassword(),
        role: formRole,
        avatarUrl: formAvatar,
        members: formMembers,
      })
    }
    resetForm()
  }

  const handleDelete = (familyId: string) => {
    if (confirmDelete === familyId) {
      deleteFamily(familyId)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(familyId)
      // 3秒后自动取消确认
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  // --- 成员管理 ---
  const addMember = (type: 'parent' | 'child') => {
    setFormMembers([...formMembers, { name: '', type }])
  }

  const updateMember = (index: number, field: keyof FamilyMember, value: string | number) => {
    const newMembers = [...formMembers]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setFormMembers(newMembers)
  }

  const removeMember = (index: number) => {
    setFormMembers(formMembers.filter((_, i) => i !== index))
  }

  // --- 工具 ---
  const generateDefaultPassword = () => {
    return Math.random().toString(36).slice(-6)
  }

  const getRoleBadge = (role: FamilyRole) => {
    switch (role) {
      case 'superadmin': return { text: '超管', color: 'bg-red-100 text-red-600' }
      case 'admin': return { text: '管理', color: 'bg-primary-100 text-primary-600' }
      case 'member': return { text: '成员', color: 'bg-gray-100 text-gray-600' }
    }
  }

  return (
    <div className="page-container pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
          ← 返回
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">家庭管理</h1>
        <button onClick={openCreateForm} className="btn-primary text-sm px-4 py-2">
          + 添加家庭
        </button>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-primary-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-primary-600">
            {data.families.filter(f => f.role !== 'superadmin').length}
          </div>
          <div className="text-xs text-primary-500">家庭总数</div>
        </div>
        <div className="bg-sky-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-sky-600">
            {data.families.filter(f => f.role === 'admin').length}
          </div>
          <div className="text-xs text-sky-500">管理员</div>
        </div>
        <div className="bg-mint-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-mint-600">
            {data.families.reduce((sum, f) => sum + f.members.length, 0)}
          </div>
          <div className="text-xs text-mint-500">总成员数</div>
        </div>
      </div>

      {/* 家庭列表 */}
      <div className="space-y-3">
        {familyList.map(family => {
          const badge = getRoleBadge(family.role)
          const stats = calcAttendance(family.id, family.name, data.activities, data.checkIns)
          const isCurrentUser = currentFamily?.id === family.id
          const canEdit = isSuperAdmin() || (isCurrentUser && family.role !== 'superadmin')
          const canDelete = isSuperAdmin() && family.role !== 'superadmin' && !isCurrentUser

          return (
            <div
              key={family.id}
              className={`card p-4 ${isCurrentUser ? 'ring-2 ring-primary-300' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* 头像 */}
                <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {family.avatarUrl || '🏠'}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 truncate">{family.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>{badge.text}</span>
                    {isCurrentUser && (
                      <span className="text-xs text-primary-500">（当前）</span>
                    )}
                  </div>

                  {/* 成员 */}
                  <div className="text-sm text-gray-500 mt-1">
                    {family.members.length > 0 ? (
                      family.members.map((m, i) => (
                        <span key={i}>
                          {i > 0 && '、'}
                          {m.name || (m.type === 'parent' ? '家长' : '小朋友')}
                          {m.type === 'child' && m.age ? `(${m.age}岁)` : ''}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">暂无成员信息</span>
                    )}
                  </div>

                  {/* 出勤 */}
                  <div className="text-xs text-gray-400 mt-1">
                    出勤 {stats.attended}/{stats.totalActivities}次 · {stats.rate}%
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 flex-shrink-0">
                  {canEdit && (
                    <button
                      onClick={() => openEditForm(family.id)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      编辑
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(family.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        confirmDelete === family.id
                          ? 'bg-red-500 text-white'
                          : 'bg-red-50 hover:bg-red-100 text-red-500'
                      }`}
                    >
                      {confirmDelete === family.id ? '确认删除' : '删除'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {familyList.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
            <div>还没有家庭成员</div>
            <button onClick={openCreateForm} className="btn-primary mt-4 text-sm px-6 py-2">
              添加第一个家庭
            </button>
          </div>
        )}
      </div>

      {/* 创建/编辑表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? '编辑家庭' : '添加新家庭'}
            </h2>

            {/* 头像选择 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">选择头像</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    onClick={() => setFormAvatar(avatar)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                      formAvatar === avatar
                        ? 'bg-primary-100 ring-2 ring-primary-400 scale-110'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* 家庭名称 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">家庭名称 *</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="例如：欢乐熊家庭"
                className="input-field"
                maxLength={20}
              />
            </div>

            {/* 登录密码 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">登录密码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="设置登录密码"
                  className="input-field flex-1"
                />
                <button
                  onClick={() => setFormPassword(generateDefaultPassword())}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-lg transition-colors"
                >
                  随机
                </button>
              </div>
            </div>

            {/* 角色设置（仅超管可设置）*/}
            {isSuperAdmin() && editingId !== currentFamily?.id && (
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">角色</label>
                <div className="flex gap-2">
                  {(['member', 'admin'] as FamilyRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => setFormRole(role)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        formRole === role
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {role === 'admin' ? '管理员' : '普通成员'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 家庭成员 */}
            <div className="mb-6">
              <label className="text-sm text-gray-600 mb-2 block">家庭成员</label>
              
              <div className="space-y-2 mb-3">
                {formMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                    <span className="text-sm w-10 text-center">
                      {member.type === 'parent' ? '👤' : '🧒'}
                    </span>
                    <input
                      type="text"
                      value={member.name}
                      onChange={e => updateMember(idx, 'name', e.target.value)}
                      placeholder={member.type === 'parent' ? '家长姓名' : '孩子姓名'}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                    />
                    {member.type === 'child' && (
                      <input
                        type="number"
                        value={member.age || ''}
                        onChange={e => updateMember(idx, 'age', parseInt(e.target.value) || 0)}
                        placeholder="年龄"
                        className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                        min={0}
                        max={18}
                      />
                    )}
                    <button
                      onClick={() => removeMember(idx)}
                      className="text-red-400 hover:text-red-600 text-sm px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addMember('parent')}
                  className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl transition-colors"
                >
                  + 添加家长
                </button>
                <button
                  onClick={() => addMember('child')}
                  className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl transition-colors"
                >
                  + 添加小朋友
                </button>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-3">
              <button onClick={resetForm} className="btn-secondary flex-1">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formName.trim()}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                {editingId ? '保存修改' : '创建家庭'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
