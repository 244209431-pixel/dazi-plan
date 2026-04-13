// ============================================
// 搭子计划 - 状态管理 (Zustand)
// ============================================

import { create } from 'zustand'
import type {
  AppData, Family, Chapter, Activity, CheckIn,
  Photo, Vote, VoteRecord, Comment, ManualBadge,
  RotationSchedule, ActivityCategory, ActivityStatus,
  FamilyMember, Registration
} from '@/types'
import { loadData, saveData, saveAuthToken, getAuthToken, clearAuthToken, generateId } from '@/lib/storage'

// --- 认证 Store ---
interface AuthState {
  currentFamily: Family | null
  isLoggedIn: boolean
  login: (familyId: string, password: string) => boolean
  logout: () => void
  restoreSession: () => void
  isSuperAdmin: () => boolean
  isAdmin: () => boolean
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentFamily: null,
  isLoggedIn: false,

  login: (familyId: string, password: string) => {
    const data = loadData()
    // 支持用 familyId 或 familyName 登录
    const family = data.families.find(
      f => (f.id === familyId || f.name === familyId) && f.password === password
    )
    if (family) {
      set({ currentFamily: family, isLoggedIn: true })
      saveAuthToken(family.id)
      return true
    }
    return false
  },

  logout: () => {
    set({ currentFamily: null, isLoggedIn: false })
    clearAuthToken()
  },

  restoreSession: () => {
    const token = getAuthToken()
    if (token) {
      const data = loadData()
      const family = data.families.find(f => f.id === token)
      if (family) {
        set({ currentFamily: family, isLoggedIn: true })
      } else {
        clearAuthToken()
      }
    }
  },

  isSuperAdmin: () => get().currentFamily?.role === 'superadmin',
  isAdmin: () => {
    const role = get().currentFamily?.role
    return role === 'superadmin' || role === 'admin'
  },
  hasPermission: (permission: string) => {
    const role = get().currentFamily?.role
    if (!role) return false
    if (role === 'superadmin') return true
    if (role === 'admin') {
      const adminPerms = ['manage_activities', 'manage_rotation', 'manual_checkin', 'invite_members', 'view_all']
      return adminPerms.includes(permission)
    }
    const memberPerms = ['self_checkin', 'upload_photos', 'vote', 'comment', 'view_own']
    return memberPerms.includes(permission)
  },
}))

// --- 应用数据 Store ---
interface AppState {
  data: AppData
  activeChapter: Chapter | null
  loadAppData: () => void
  
  // 家庭管理
  addFamily: (family: Omit<Family, 'id' | 'createdAt'>) => Family
  updateFamily: (id: string, updates: Partial<Family>) => void
  deleteFamily: (id: string) => void
  getFamilyById: (id: string) => Family | undefined
  
  // 章节管理
  addChapter: (chapter: Omit<Chapter, 'id'>) => Chapter
  endChapter: (id: string) => void
  
  // 活动管理
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Activity
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  getActivitiesByChapter: (chapterId: string) => Activity[]
  
  // 签到
  checkIn: (activityId: string, familyId: string, by: 'self' | 'admin') => void
  undoCheckIn: (activityId: string, familyId: string) => void
  isCheckedIn: (activityId: string, familyId: string) => boolean
  
  // 照片
  addPhoto: (photo: Omit<Photo, 'id' | 'uploadedAt'>) => void
  getPhotosByActivity: (activityId: string) => Photo[]
  
  // 投票
  addVote: (vote: Omit<Vote, 'id' | 'createdAt'>) => Vote
  submitVote: (voteId: string, familyId: string, optionIndex: number) => void
  getVoteByActivity: (activityId: string) => Vote | undefined
  getVoteResults: (voteId: string) => { optionIndex: number; count: number }[]
  
  // 留言
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void
  getCommentsByActivity: (activityId: string) => Comment[]
  
  // 勋章
  grantBadge: (badge: Omit<ManualBadge, 'id' | 'grantedAt'>) => void
  
  // 轮值排班
  setRotation: (schedules: Omit<RotationSchedule, 'id'>[]) => void
  getRotationByChapter: (chapterId: string) => RotationSchedule[]
  
  // 注册申请
  submitRegistration: (reg: { familyName: string; members: FamilyMember[]; contactInfo: string; message: string }) => Registration
  approveRegistration: (regId: string, reviewerId: string, password?: string) => Family | null
  rejectRegistration: (regId: string, reviewerId: string, reason: string) => void
  getPendingRegistrations: () => Registration[]
  
  // 工具方法
  _save: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  data: loadData(),
  activeChapter: null,

  loadAppData: () => {
    const data = loadData()
    const activeChapter = data.chapters.find(c => c.isActive) || null
    set({ data, activeChapter })
  },

  // === 家庭管理 ===
  addFamily: (familyData) => {
    const family: Family = {
      ...familyData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    const data = get().data
    data.families.push(family)
    get()._save()
    return family
  },

  updateFamily: (id, updates) => {
    const data = get().data
    const idx = data.families.findIndex(f => f.id === id)
    if (idx !== -1) {
      data.families[idx] = { ...data.families[idx], ...updates }
      get()._save()
    }
  },

  deleteFamily: (id) => {
    const data = get().data
    data.families = data.families.filter(f => f.id !== id)
    get()._save()
  },

  getFamilyById: (id) => get().data.families.find(f => f.id === id),

  // === 章节管理 ===
  addChapter: (chapterData) => {
    const data = get().data
    // 先存档：将当前活跃章节标记为非活跃
    data.chapters.forEach(c => { c.isActive = false })
    const chapter: Chapter = {
      ...chapterData,
      id: generateId(),
    }
    data.chapters.push(chapter)
    set({ activeChapter: chapter })
    get()._save()
    return chapter
  },

  endChapter: (id) => {
    const data = get().data
    const chapter = data.chapters.find(c => c.id === id)
    if (chapter) {
      chapter.isActive = false
      set({ activeChapter: null })
      get()._save()
    }
  },

  // === 活动管理 ===
  addActivity: (activityData) => {
    const activity: Activity = {
      ...activityData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    get().data.activities.push(activity)
    get()._save()
    return activity
  },

  updateActivity: (id, updates) => {
    const data = get().data
    const idx = data.activities.findIndex(a => a.id === id)
    if (idx !== -1) {
      data.activities[idx] = { ...data.activities[idx], ...updates }
      get()._save()
    }
  },

  deleteActivity: (id) => {
    const data = get().data
    data.activities = data.activities.filter(a => a.id !== id)
    get()._save()
  },

  getActivitiesByChapter: (chapterId) =>
    get().data.activities
      .filter(a => a.chapterId === chapterId)
      .sort((a, b) => a.date.localeCompare(b.date)),

  // === 签到 ===
  checkIn: (activityId, familyId, by) => {
    const data = get().data
    // 避免重复签到
    if (!data.checkIns.some(c => c.activityId === activityId && c.familyId === familyId)) {
      data.checkIns.push({
        id: generateId(),
        activityId,
        familyId,
        checkedAt: new Date().toISOString(),
        checkedBy: by,
      })
      get()._save()
    }
  },

  undoCheckIn: (activityId, familyId) => {
    const data = get().data
    data.checkIns = data.checkIns.filter(
      c => !(c.activityId === activityId && c.familyId === familyId)
    )
    get()._save()
  },

  isCheckedIn: (activityId, familyId) =>
    get().data.checkIns.some(c => c.activityId === activityId && c.familyId === familyId),

  // === 照片 ===
  addPhoto: (photoData) => {
    get().data.photos.push({
      ...photoData,
      id: generateId(),
      uploadedAt: new Date().toISOString(),
    })
    get()._save()
  },

  getPhotosByActivity: (activityId) =>
    get().data.photos.filter(p => p.activityId === activityId),

  // === 投票 ===
  addVote: (voteData) => {
    const vote: Vote = {
      ...voteData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    get().data.votes.push(vote)
    get()._save()
    return vote
  },

  submitVote: (voteId, familyId, optionIndex) => {
    const data = get().data
    // 避免重复投票
    if (!data.voteRecords.some(v => v.voteId === voteId && v.familyId === familyId)) {
      data.voteRecords.push({
        id: generateId(),
        voteId,
        familyId,
        optionIndex,
        votedAt: new Date().toISOString(),
      })
      get()._save()
    }
  },

  getVoteByActivity: (activityId) =>
    get().data.votes.find(v => v.activityId === activityId),

  getVoteResults: (voteId) => {
    const records = get().data.voteRecords.filter(v => v.voteId === voteId)
    const vote = get().data.votes.find(v => v.id === voteId)
    if (!vote) return []
    return vote.options.map(opt => ({
      optionIndex: opt.index,
      count: records.filter(r => r.optionIndex === opt.index).length,
    }))
  },

  // === 留言 ===
  addComment: (commentData) => {
    get().data.comments.push({
      ...commentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    })
    get()._save()
  },

  getCommentsByActivity: (activityId) =>
    get().data.comments
      .filter(c => c.activityId === activityId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  // === 勋章 ===
  grantBadge: (badgeData) => {
    get().data.manualBadges.push({
      ...badgeData,
      id: generateId(),
      grantedAt: new Date().toISOString(),
    })
    get()._save()
  },

  // === 轮值排班 ===
  setRotation: (schedules) => {
    const data = get().data
    // 替换对应章节的排班
    if (schedules.length > 0) {
      const chapterId = schedules[0].chapterId
      data.rotationSchedules = data.rotationSchedules.filter(r => r.chapterId !== chapterId)
      schedules.forEach(s => {
        data.rotationSchedules.push({ ...s, id: generateId() })
      })
      get()._save()
    }
  },

  getRotationByChapter: (chapterId) =>
    get().data.rotationSchedules
      .filter(r => r.chapterId === chapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex),

  // === 注册申请 ===
  submitRegistration: (regData) => {
    const registration: Registration = {
      id: generateId(),
      familyName: regData.familyName,
      members: regData.members,
      contactInfo: regData.contactInfo,
      message: regData.message,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      rejectReason: null,
    }
    get().data.registrations.push(registration)
    get()._save()
    return registration
  },

  approveRegistration: (regId, reviewerId, password) => {
    const data = get().data
    const reg = data.registrations.find(r => r.id === regId)
    if (!reg || reg.status !== 'pending') return null

    // 先存档：更新注册申请状态
    reg.status = 'approved'
    reg.reviewedAt = new Date().toISOString()
    reg.reviewedBy = reviewerId

    // 再创建：生成新家庭账号
    const newFamily: Family = {
      id: generateId(),
      name: reg.familyName,
      avatarUrl: null,
      role: 'member',
      members: reg.members,
      password: password || Math.random().toString(36).slice(-6),
      createdAt: new Date().toISOString(),
    }
    data.families.push(newFamily)
    get()._save()
    return newFamily
  },

  rejectRegistration: (regId, reviewerId, reason) => {
    const data = get().data
    const reg = data.registrations.find(r => r.id === regId)
    if (!reg || reg.status !== 'pending') return

    reg.status = 'rejected'
    reg.reviewedAt = new Date().toISOString()
    reg.reviewedBy = reviewerId
    reg.rejectReason = reason
    get()._save()
  },

  getPendingRegistrations: () =>
    get().data.registrations.filter(r => r.status === 'pending'),

  // === 内部工具 ===
  _save: () => {
    const data = get().data
    saveData(data)
    set({ data: { ...data } }) // 触发重新渲染
  },
}))
