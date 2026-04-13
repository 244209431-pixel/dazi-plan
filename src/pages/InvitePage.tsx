// ============================================
// 搭子计划 - 邀请函 H5 页面（公开访问，无需登录）
// ============================================

import { useState } from 'react'
import { useAppStore } from '@/store'
import type { FamilyMember } from '@/types'
import { Sparkles, Users, Calendar, Trophy, ChevronDown, Check, Heart } from 'lucide-react'

type PageState = 'intro' | 'form' | 'success'

export default function InvitePage() {
  const [pageState, setPageState] = useState<PageState>('intro')
  const [familyName, setFamilyName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [message, setMessage] = useState('')
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submitRegistration = useAppStore(s => s.submitRegistration)

  // --- 成员管理 ---
  const addMember = (type: 'parent' | 'child') => {
    setMembers([...members, { name: '', type }])
  }

  const updateMember = (index: number, field: keyof FamilyMember, value: string | number) => {
    const newMembers = [...members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setMembers(newMembers)
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  // --- 提交注册 ---
  const handleSubmit = async () => {
    setError('')

    // 表单验证
    if (!familyName.trim()) {
      setError('请输入你的家庭名称')
      return
    }
    if (members.length === 0) {
      setError('请至少添加一位家庭成员')
      return
    }
    if (members.some(m => !m.name.trim())) {
      setError('请填写所有成员的姓名')
      return
    }
    if (!contactInfo.trim()) {
      setError('请留下你的联系方式，方便管理员联系你')
      return
    }

    setIsSubmitting(true)
    // 模拟网络延迟
    await new Promise(r => setTimeout(r, 800))

    submitRegistration({
      familyName: familyName.trim(),
      members,
      contactInfo: contactInfo.trim(),
      message: message.trim(),
    })

    setIsSubmitting(false)
    setPageState('success')
  }

  // ========== 介绍页 ==========
  if (pageState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 via-warm-50 to-white">
        {/* 顶部装饰 */}
        <div className="relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute -top-10 right-0 w-48 h-48 bg-warm-200/30 rounded-full blur-3xl" />
          <div className="absolute top-32 left-1/2 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl" />

          {/* Logo + 标题 */}
          <div className="relative z-10 text-center pt-12 pb-6 px-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-warm-400
                            rounded-[2rem] shadow-glow flex items-center justify-center animate-bounce-soft">
              <span className="text-5xl">🎪</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-gradient mb-2">
              搭子计划
            </h1>
            <p className="text-gray-500 text-sm">
              家庭遛娃搭子社群 · 一起探索成长
            </p>
          </div>
        </div>

        {/* 邀请函内容 */}
        <div className="px-6 pb-8">
          {/* 邀请卡片 */}
          <div className="bg-white rounded-3xl shadow-card p-6 mb-6 border border-primary-100/50">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
                <Heart className="w-4 h-4" />
                <span>你收到了一封邀请</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
                诚邀你的家庭<br />
                加入我们的遛娃搭子团！
              </h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              「搭子计划」是一个由志同道合的家庭组成的亲子活动社群。
              我们定期组织丰富多彩的户外活动，让孩子们结交好朋友，让家长们分享育儿心得 ✨
            </p>

            {/* 亮点介绍 */}
            <div className="space-y-3">
              {[
                { icon: <Calendar className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600', title: '定期活动', desc: '每两周一次精心策划的亲子活动' },
                { icon: <Users className="w-5 h-5" />, color: 'bg-mint-50 text-mint-600', title: '五大分类', desc: '户外运动·文化艺术·科学探索·社交合作·生活技能' },
                { icon: <Trophy className="w-5 h-5" />, color: 'bg-warm-50 text-warm-600', title: '勋章成就', desc: '参与活动收集勋章，见证孩子成长足迹' },
                { icon: <Sparkles className="w-5 h-5" />, color: 'bg-lavender-50 text-lavender-600', title: '轮值策划', desc: '每个家庭都有机会策划专属活动' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 小朋友互动装饰 */}
          <div className="flex items-center justify-center gap-2 mb-6 text-2xl">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>👦</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>👧</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🤝</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>👦</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>👧</span>
          </div>

          {/* 引导滚动 */}
          <div className="text-center mb-4">
            <ChevronDown className="w-5 h-5 text-gray-300 mx-auto animate-bounce" />
          </div>

          {/* 注册按钮 */}
          <button
            onClick={() => setPageState('form')}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 rounded-2xl shadow-glow"
          >
            <Sparkles className="w-5 h-5" />
            我要加入！
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            提交注册申请后，管理员审核通过即可登录使用
          </p>
        </div>
      </div>
    )
  }

  // ========== 注册表单页 ==========
  if (pageState === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
        {/* 顶部 */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPageState('intro')}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← 返回
            </button>
            <h1 className="text-lg font-bold text-gray-800">注册申请</h1>
          </div>
        </div>

        <div className="px-6 py-6 pb-20">
          {/* 提示 */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-lg">📝</span>
              <div>
                <div className="text-sm font-medium text-primary-700">填写你的家庭信息</div>
                <div className="text-xs text-primary-500 mt-0.5">
                  提交后由管理员审核，通过后会告知你登录密码
                </div>
              </div>
            </div>
          </div>

          {/* 家庭名称 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              家庭名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              placeholder="给你的家庭起个好听的名字，如：阳光花家庭"
              className="input-field"
              maxLength={20}
            />
          </div>

          {/* 家庭成员 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              家庭成员 <span className="text-red-400">*</span>
            </label>

            <div className="space-y-2 mb-3">
              {members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                  <span className="text-base w-8 text-center">
                    {member.type === 'parent' ? '👤' : '🧒'}
                  </span>
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateMember(idx, 'name', e.target.value)}
                    placeholder={member.type === 'parent' ? '家长姓名' : '孩子姓名'}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                  {member.type === 'child' && (
                    <input
                      type="number"
                      value={member.age || ''}
                      onChange={e => updateMember(idx, 'age', parseInt(e.target.value) || 0)}
                      placeholder="年龄"
                      className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-300"
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

              {members.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-xl">
                  点击下方按钮添加家庭成员
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addMember('parent')}
                className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl transition-colors"
              >
                + 添加家长
              </button>
              <button
                onClick={() => addMember('child')}
                className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl transition-colors"
              >
                + 添加小朋友
              </button>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              联系方式 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
              placeholder="微信号或手机号，方便管理员联系你"
              className="input-field"
            />
          </div>

          {/* 申请留言 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              想说的话 <span className="text-gray-400">（选填）</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="简单介绍一下你们家庭吧～"
              className="input-field resize-none h-24"
              maxLength={200}
            />
            <div className="text-xs text-gray-400 text-right mt-1">
              {message.length}/200
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5 rounded-2xl"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                确认注册
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            提交后请耐心等待管理员审核 🎉
          </p>
        </div>
      </div>
    )
  }

  // ========== 提交成功页 ==========
  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50 via-white to-white flex flex-col items-center justify-center px-6">
      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 right-0 h-72 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-mint-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-0 w-48 h-48 bg-primary-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center animate-fade-in">
        {/* 成功图标 */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-mint-400 to-mint-500
                        rounded-full shadow-glow flex items-center justify-center">
          <Check className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          申请已提交！🎉
        </h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          管理员收到你的注册申请后会尽快审核<br />
          审核通过后会通过你留的联系方式告知登录密码
        </p>

        {/* 申请信息回显 */}
        <div className="bg-white rounded-2xl shadow-card p-5 text-left mb-8 max-w-sm mx-auto">
          <div className="text-sm text-gray-500 mb-3 font-medium">你的申请信息</div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🏠</span>
              <span className="text-gray-600 text-sm">{familyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">👨‍👩‍👧‍👦</span>
              <span className="text-gray-600 text-sm">
                {members.map(m => m.name).join('、')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">📱</span>
              <span className="text-gray-600 text-sm">{contactInfo}</span>
            </div>
            {message && (
              <div className="flex items-start gap-2">
                <span className="text-base">💬</span>
                <span className="text-gray-600 text-sm">{message}</span>
              </div>
            )}
          </div>
        </div>

        {/* 等待提示 */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
          等待管理员审核中...
        </div>
      </div>
    </div>
  )
}
