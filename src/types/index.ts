// ============================================
// 搭子计划 - 全局类型定义
// ============================================

// --- 角色与权限 ---
export type FamilyRole = 'superadmin' | 'admin' | 'member'

// --- 活动分类（五大类）---
export type ActivityCategory = 'outdoor' | 'culture' | 'science' | 'social' | 'life'

// --- 活动状态 ---
export type ActivityStatus = 'planned' | 'completed' | 'cancelled'

// --- 勋章类型 ---
export type BadgeType = 'explore' | 'milestone' | 'special'

// --- 家庭成员 ---
export interface FamilyMember {
  name: string
  type: 'parent' | 'child'
  age?: number
}

// --- 家庭信息（源数据）---
export interface Family {
  id: string
  name: string
  avatarUrl: string | null
  role: FamilyRole
  members: FamilyMember[]
  password: string  // 简单密码（第一期本地方案）
  createdAt: string
}

// --- 章节（源数据）---
export interface Chapter {
  id: string
  title: string       // "第一章"
  subtitle: string    // "夏日篇"
  startDate: string   // ISO date string
  endDate: string     // ISO date string
  isActive: boolean
}

// --- 活动（源数据）---
export interface Activity {
  id: string
  chapterId: string
  date: string         // ISO date string "2026-05-10"
  category: ActivityCategory
  title: string
  description: string
  hostFamilyId: string // 轮值家庭
  status: ActivityStatus
  createdAt: string
}

// --- 签到记录（源数据）---
export interface CheckIn {
  id: string
  activityId: string
  familyId: string
  checkedAt: string    // ISO datetime
  checkedBy: 'self' | 'admin'  // 自签 or 补签
}

// --- 照片（源数据）---
export interface Photo {
  id: string
  activityId: string
  familyId: string
  url: string          // base64 或 URL
  caption: string
  uploadedAt: string
}

// --- 投票（源数据）---
export interface Vote {
  id: string
  activityId: string
  title: string
  options: VoteOption[]
  createdByFamilyId: string
  deadline: string     // ISO datetime
  createdAt: string
}

export interface VoteOption {
  index: number
  text: string
  description?: string
}

// --- 投票记录（源数据）---
export interface VoteRecord {
  id: string
  voteId: string
  familyId: string
  optionIndex: number
  votedAt: string
}

// --- 留言（源数据）---
export interface Comment {
  id: string
  activityId: string
  familyId: string
  content: string
  createdAt: string
}

// --- 手动勋章（源数据）---
export interface ManualBadge {
  id: string
  familyId: string
  badgeType: BadgeType
  badgeName: string
  grantedAt: string
  grantedBy: string  // 颁发人 familyId
}

// --- 轮值排班（源数据）---
export interface RotationSchedule {
  id: string
  chapterId: string
  activityId: string
  familyId: string
  orderIndex: number
}

// --- 邀请（源数据）---
export interface Invitation {
  id: string
  code: string
  createdBy: string  // familyId
  createdAt: string
  usedBy: string | null
  usedAt: string | null
}

// --- 注册申请状态 ---
export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

// --- 注册申请（源数据）---
export interface Registration {
  id: string
  familyName: string          // 申请的家庭名称
  members: FamilyMember[]     // 家庭成员信息
  contactInfo: string         // 联系方式（微信号/手机号）
  message: string             // 申请留言
  status: RegistrationStatus
  submittedAt: string         // 提交时间
  reviewedAt: string | null   // 审核时间
  reviewedBy: string | null   // 审核人 familyId
  rejectReason: string | null // 拒绝原因
}

// --- 派生数据类型（前端推导，不持久化）---

// 出勤统计
export interface AttendanceStats {
  familyId: string
  familyName: string
  totalActivities: number
  attended: number
  rate: number  // 0-100
}

// 探索勋章状态
export interface ExploreBadgeStatus {
  category: ActivityCategory
  unlocked: boolean
  unlockedAt: string | null
}

// 里程碑勋章状态
export interface MilestoneBadgeStatus {
  milestone: number  // 1, 5, 10, 20
  unlocked: boolean
  unlockedAt: string | null
}

// 家庭勋章汇总
export interface FamilyBadgeSummary {
  familyId: string
  exploreBadges: ExploreBadgeStatus[]
  milestoneBadges: MilestoneBadgeStatus[]
  specialBadges: ManualBadge[]
  totalUnlocked: number
}

// --- 应用全局状态 ---
export interface AppData {
  families: Family[]
  chapters: Chapter[]
  activities: Activity[]
  checkIns: CheckIn[]
  photos: Photo[]
  votes: Vote[]
  voteRecords: VoteRecord[]
  comments: Comment[]
  manualBadges: ManualBadge[]
  rotationSchedules: RotationSchedule[]
  invitations: Invitation[]
  registrations: Registration[]  // 注册申请列表
  _lastSync: string  // 最后同步时间
  _version: number   // 数据版本号
}
