// ============================================
// 搭子计划 - 本地数据管理（第一期方案）
// ============================================

import type { AppData, Family } from '@/types'
import { STORAGE_KEYS, APP_CONFIG } from './constants'

// --- 默认初始数据 ---
export function createDefaultData(): AppData {
  return {
    families: [],
    chapters: [],
    activities: [],
    checkIns: [],
    photos: [],
    votes: [],
    voteRecords: [],
    comments: [],
    manualBadges: [],
    rotationSchedules: [],
    invitations: [],
    registrations: [],
    _lastSync: new Date().toISOString(),
    _version: APP_CONFIG.dataVersion,
  }
}

// --- 初始超管账号 ---
export function createSuperAdmin(): Family {
  return {
    id: 'family-superadmin',
    name: '管理员家庭',
    avatarUrl: null,
    role: 'superadmin',
    members: [{ name: '超管', type: 'parent' }],
    password: 'admin123',
    createdAt: new Date().toISOString(),
  }
}

// --- 数据读取 ---
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.appData)
    if (!raw) {
      // 首次加载，初始化数据
      const data = createDefaultData()
      data.families.push(createSuperAdmin())
      saveData(data)
      return data
    }
    const data: AppData = JSON.parse(raw)
    // 每次加载执行数据修复
    return repairData(data)
  } catch (e) {
    console.error('数据加载失败，使用默认数据:', e)
    const data = createDefaultData()
    data.families.push(createSuperAdmin())
    saveData(data)
    return data
  }
}

// --- 数据保存 ---
export function saveData(data: AppData): void {
  data._lastSync = new Date().toISOString()
  localStorage.setItem(STORAGE_KEYS.appData, JSON.stringify(data))
}

// --- 数据修复引擎（每次加载执行）---
export function repairData(data: AppData): AppData {
  // 阶段1：字段兼容性修复
  if (!data._version) data._version = 1
  if (!data._lastSync) data._lastSync = new Date().toISOString()
  if (!data.families) data.families = []
  if (!data.chapters) data.chapters = []
  if (!data.activities) data.activities = []
  if (!data.checkIns) data.checkIns = []
  if (!data.photos) data.photos = []
  if (!data.votes) data.votes = []
  if (!data.voteRecords) data.voteRecords = []
  if (!data.comments) data.comments = []
  if (!data.manualBadges) data.manualBadges = []
  if (!data.rotationSchedules) data.rotationSchedules = []
  if (!data.invitations) data.invitations = []
  if (!data.registrations) data.registrations = []

  // 阶段2：确保超管存在
  const hasSuperAdmin = data.families.some(f => f.role === 'superadmin')
  if (!hasSuperAdmin) {
    data.families.push(createSuperAdmin())
  }

  // 阶段3：修复家庭数据字段
  data.families = data.families.map(f => ({
    ...f,
    members: f.members || [],
    avatarUrl: f.avatarUrl || null,
    password: f.password || '123456',
  }))

  // 保存修复后的数据
  saveData(data)
  return data
}

// --- 认证 Token 管理 ---
export function saveAuthToken(familyId: string): void {
  localStorage.setItem(STORAGE_KEYS.authToken, familyId)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.authToken)
}

export function clearAuthToken(): void {
  localStorage.removeItem(STORAGE_KEYS.authToken)
}

// --- UUID 生成 ---
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
