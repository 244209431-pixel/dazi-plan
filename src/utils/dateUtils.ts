// ============================================
// 搭子计划 - 日期工具函数
// ============================================

import {
  format,
  addWeeks,
  startOfWeek,
  isSameDay,
  isAfter,
  isBefore,
  parseISO,
  differenceInDays,
  nextSunday,
  addMonths,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

// --- 格式化日期 ---
export function formatDate(date: string | Date, pattern = 'MM月dd日'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: zhCN })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MM月dd日 HH:mm', { locale: zhCN })
}

export function formatWeekday(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE', { locale: zhCN })
}

// --- 生成活动日期列表 ---
// 从起始日期开始，每两周一次，周日
export function generateActivityDates(
  startDate: string,
  endDate: string,
  intervalWeeks = 2
): string[] {
  const dates: string[] = []
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  // 找到起始日期后的第一个周日
  let current = start.getDay() === 0 ? start : nextSunday(start)

  while (!isAfter(current, end)) {
    dates.push(format(current, 'yyyy-MM-dd'))
    current = addWeeks(current, intervalWeeks)
  }

  return dates
}

// --- 计算距离下次活动的天数 ---
export function daysUntilNextActivity(activityDates: string[]): number | null {
  const today = new Date()
  const upcoming = activityDates
    .map(d => parseISO(d))
    .find(d => isAfter(d, today) || isSameDay(d, today))

  if (!upcoming) return null
  return differenceInDays(upcoming, today)
}

// --- 判断是否是活动日 ---
export function isActivityDay(date: Date, activityDates: string[]): boolean {
  return activityDates.some(d => isSameDay(parseISO(d), date))
}

// --- 获取当前章节日期范围 ---
export function getChapterDateRange(startDate: string, durationMonths = 3) {
  const start = parseISO(startDate)
  const end = addMonths(start, durationMonths)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

// --- 获取今天的 ISO 日期字符串 ---
export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// --- 判断日期是否在范围内 ---
export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const d = parseISO(date)
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return (isAfter(d, start) || isSameDay(d, start)) && (isBefore(d, end) || isSameDay(d, end))
}

// --- 获取本周起始 ---
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // 周一为一周开始
}

// --- 友好时间显示 ---
export function timeAgo(dateStr: string): string {
  const date = parseISO(dateStr)
  const now = new Date()
  const diff = differenceInDays(now, date)

  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`
  if (diff < 30) return `${Math.floor(diff / 7)}周前`
  if (diff < 365) return `${Math.floor(diff / 30)}个月前`
  return `${Math.floor(diff / 365)}年前`
}
