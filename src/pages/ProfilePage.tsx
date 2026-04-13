import { useState } from 'react'
import { useAuthStore, useAppStore } from '@/store'
import { Save, Plus, X } from 'lucide-react'
import { DEFAULT_AVATARS } from '@/lib/constants'
import type { FamilyMember } from '@/types'

export default function ProfilePage() {
  const currentFamily = useAuthStore(s => s.currentFamily)
  const updateFamily = useAppStore(s => s.updateFamily)
  const restoreSession = useAuthStore(s => s.restoreSession)

  const [name, setName] = useState(currentFamily?.name || '')
  const [members, setMembers] = useState<FamilyMember[]>(currentFamily?.members || [])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberType, setNewMemberType] = useState<'parent' | 'child'>('child')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!currentFamily) return
    updateFamily(currentFamily.id, {
      name: name.trim() || currentFamily.name,
      members,
    })
    restoreSession()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addMember = () => {
    if (!newMemberName.trim()) return
    setMembers([...members, { name: newMemberName.trim(), type: newMemberType }])
    setNewMemberName('')
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  if (!currentFamily) return null

  return (
    <div className="page-container space-y-5">
      <div className="text-center">
        <h1 className="page-title">👤 家庭资料</h1>
      </div>

      {/* 头像 */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-warm-400
                        flex items-center justify-center text-white text-3xl font-bold shadow-glow">
          {name.charAt(0) || '?'}
        </div>
      </div>

      {/* 基本信息 */}
      <div className="card space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">家庭名称</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">角色</label>
          <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm text-gray-600">
            {currentFamily.role === 'superadmin' ? '🔑 超级管理员' :
             currentFamily.role === 'admin' ? '⚙️ 管理员' : '👨‍👩‍👧 普通家庭'}
          </div>
        </div>
      </div>

      {/* 家庭成员 */}
      <div className="card space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">👨‍👩‍👧‍👦 家庭成员</h3>
        
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <span className="text-lg">{m.type === 'parent' ? '👩' : '👧'}</span>
            <span className="text-sm text-gray-700 flex-1">{m.name}</span>
            <span className="text-[10px] text-gray-400">{m.type === 'parent' ? '家长' : '孩子'}</span>
            <button onClick={() => removeMember(i)} className="text-gray-300 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* 添加成员 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            placeholder="成员名称"
            className="input-field flex-1 text-sm py-2"
          />
          <select
            value={newMemberType}
            onChange={e => setNewMemberType(e.target.value as 'parent' | 'child')}
            className="input-field w-20 text-sm py-2"
          >
            <option value="parent">家长</option>
            <option value="child">孩子</option>
          </select>
          <button
            onClick={addMember}
            className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center
                       hover:bg-primary-600 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 保存按钮 */}
      <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
        <Save className="w-4 h-4" />
        {saved ? '✅ 已保存' : '保存资料'}
      </button>
    </div>
  )
}
