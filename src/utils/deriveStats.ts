// ============================================
// 搭子计划 - 派生数据计算（纯函数）
// ============================================
// 所有派生数据从源数据实时推导，不持久化存储

import type {
  Activity,
  CheckIn,
  Family,
  AttendanceStats,
  ExploreBadgeStatus,
  MilestoneBadgeStatus,
  FamilyBadgeSummary,
  ManualBadge,
  ActivityCategory,
} from '@/types'
import { MILESTONES } from '@/lib/constants'

const ALL_CATEGORIES: ActivityCategory[] = ['outdoor', 'culture', 'science', 'social', 'life']

// --- 计算单个家庭的出勤统计 ---
export function calcAttendance(
  familyId: string,
  familyName: string,
  activities: Activity[],
  checkIns: CheckIn[]
): AttendanceStats {
  // 只统计已完成的活动
  const completedActivities = activities.filter(a => a.status === 'completed')
  const totalActivities = completedActivities.length
  const attended = completedActivities.filter(
    a => checkIns.some(c => c.activityId === a.id && c.familyId === familyId)
  ).length

  return {
    familyId,
    familyName,
    totalActivities,
    attended,
    rate: totalActivities > 0 ? Math.round((attended / totalActivities) * 100) : 0,
  }
}

// --- 计算所有家庭的出勤排行 ---
export function calcLeaderboard(
  families: Family[],
  activities: Activity[],
  checkIns: CheckIn[]
): AttendanceStats[] {
  return families
    .filter(f => f.role !== 'superadmin' || families.length <= 1) // 超管如果是唯一用户则显示
    .map(f => calcAttendance(f.id, f.name, activities, checkIns))
    .sort((a, b) => b.attended - a.attended || b.rate - a.rate)
}

// --- 计算探索勋章状态 ---
export function calcExploreBadges(
  familyId: string,
  activities: Activity[],
  checkIns: CheckIn[]
): ExploreBadgeStatus[] {
  const familyCheckIns = checkIns.filter(c => c.familyId === familyId)
  const attendedActivities = activities.filter(
    a => familyCheckIns.some(c => c.activityId === a.id)
  )

  return ALL_CATEGORIES.map(category => {
    const attended = attendedActivities.find(a => a.category === category)
    return {
      category,
      unlocked: !!attended,
      unlockedAt: attended
        ? familyCheckIns.find(c => c.activityId === attended.id)?.checkedAt || null
        : null,
    }
  })
}

// --- 计算里程碑勋章状态 ---
export function calcMilestoneBadges(
  familyId: string,
  checkIns: CheckIn[]
): MilestoneBadgeStatus[] {
  const totalAttended = new Set(
    checkIns.filter(c => c.familyId === familyId).map(c => c.activityId)
  ).size

  return MILESTONES.map(milestone => ({
    milestone,
    unlocked: totalAttended >= milestone,
    unlockedAt: totalAttended >= milestone ? new Date().toISOString() : null,
  }))
}

// --- 汇总家庭所有勋章 ---
export function calcFamilyBadges(
  familyId: string,
  activities: Activity[],
  checkIns: CheckIn[],
  manualBadges: ManualBadge[]
): FamilyBadgeSummary {
  const exploreBadges = calcExploreBadges(familyId, activities, checkIns)
  const milestoneBadges = calcMilestoneBadges(familyId, checkIns)
  const specialBadges = manualBadges.filter(b => b.familyId === familyId)

  const totalUnlocked =
    exploreBadges.filter(b => b.unlocked).length +
    milestoneBadges.filter(b => b.unlocked).length +
    specialBadges.length

  return {
    familyId,
    exploreBadges,
    milestoneBadges,
    specialBadges,
    totalUnlocked,
  }
}
