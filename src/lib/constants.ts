// ============================================
// 搭子计划 - 常量定义
// ============================================

import type { ActivityCategory } from '@/types'

// --- 活动分类配置 ---
export const ACTIVITY_CATEGORIES: Record<ActivityCategory, {
  label: string
  emoji: string
  color: string       // Tailwind 颜色类名前缀
  bgColor: string     // 背景色
  textColor: string   // 文字色
  description: string
}> = {
  outdoor: {
    label: '户外运动',
    emoji: '🏃‍♂️',
    color: 'mint',
    bgColor: 'bg-mint-100',
    textColor: 'text-mint-700',
    description: '公园、徒步、骑行、野餐等户外活动',
  },
  culture: {
    label: '文化艺术',
    emoji: '🎨',
    color: 'lavender',
    bgColor: 'bg-lavender-100',
    textColor: 'text-lavender-700',
    description: '博物馆、画展、手工艺、音乐等文化活动',
  },
  science: {
    label: '科学探索',
    emoji: '🔬',
    color: 'sky',
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-700',
    description: '科技馆、天文观测、实验探索等科学活动',
  },
  social: {
    label: '社交合作',
    emoji: '🤝',
    color: 'primary',
    bgColor: 'bg-primary-100',
    textColor: 'text-primary-700',
    description: '团队游戏、联合运动、聚会社交等合作活动',
  },
  life: {
    label: '生活技能',
    emoji: '🍳',
    color: 'rose',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-700',
    description: '烹饪、种植、手工制作、生活实践等技能活动',
  },
}

// --- 里程碑配置 ---
export const MILESTONES = [1, 5, 10, 20] as const

export const MILESTONE_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: '初次冒险', emoji: '🌱' },
  5: { label: '探索小达人', emoji: '⭐' },
  10: { label: '活动之星', emoji: '🌟' },
  20: { label: '超级搭子', emoji: '👑' },
}

// --- 特别勋章预设 ---
export const SPECIAL_BADGES = [
  { id: 'full-attendance', name: '全勤之星', emoji: '🏆', description: '本章所有活动全勤参与' },
  { id: 'best-partner', name: '最佳搭子', emoji: '💝', description: '本章最受欢迎的搭子家庭' },
  { id: 'super-organizer', name: '超级策划', emoji: '🎯', description: '策划了最受欢迎的活动' },
  { id: 'photo-master', name: '记录达人', emoji: '📸', description: '上传了最多精彩照片' },
  { id: 'comment-star', name: '留言之星', emoji: '💬', description: '最活跃的留言参与者' },
]

// --- 章节主题预设 ---
export const CHAPTER_THEMES = [
  { title: '第一章', subtitle: '夏日篇', emoji: '☀️' },
  { title: '第二章', subtitle: '秋实篇', emoji: '🍂' },
  { title: '第三章', subtitle: '冬趣篇', emoji: '❄️' },
  { title: '第四章', subtitle: '春芽篇', emoji: '🌸' },
  { title: '第五章', subtitle: '盛夏篇', emoji: '🌊' },
  { title: '第六章', subtitle: '金秋篇', emoji: '🎃' },
  { title: '第七章', subtitle: '暖冬篇', emoji: '🎄' },
  { title: '第八章', subtitle: '新春篇', emoji: '🧧' },
]

// --- 家庭默认头像 ---
export const DEFAULT_AVATARS = [
  '🏠', '🏡', '🌈', '🌻', '🎪', '🎠', '🏕️', '🎈',
  '🦁', '🐼', '🦊', '🐰', '🐻', '🦋', '🐬', '🦄',
]

// --- 权限配置 ---
export const PERMISSIONS = {
  superadmin: [
    'manage_families',
    'manage_chapters',
    'manage_activities',
    'manage_rotation',
    'manual_checkin',
    'grant_badges',
    'assign_admin',
    'invite_members',
    'view_all',
  ],
  admin: [
    'manage_activities',
    'manage_rotation',
    'manual_checkin',
    'invite_members',
    'view_all',
  ],
  member: [
    'self_checkin',
    'upload_photos',
    'vote',
    'comment',
    'view_own',
  ],
} as const

// --- 应用配置 ---
export const APP_CONFIG = {
  name: '搭子计划',
  version: '1.0.0',
  activityIntervalWeeks: 2,  // 每两周一次
  activityDay: 0,            // 周日（0=周日）
  chapterDurationMonths: 3,  // 每章三个月
  firstChapterStart: '2026-05-10',  // 第一章开始日期
  dataVersion: 1,
}

// --- localStorage 键名 ---
export const STORAGE_KEYS = {
  appData: 'dazi-plan-data',
  authToken: 'dazi-plan-auth',
  theme: 'dazi-plan-theme',
} as const
