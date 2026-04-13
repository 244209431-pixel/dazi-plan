import { useMemo } from 'react'
import { useAppStore } from '@/store'
import { ACTIVITY_CATEGORIES } from '@/lib/constants'
import { Image as ImageIcon } from 'lucide-react'

export default function AlbumPage() {
  const data = useAppStore(s => s.data)

  // 按活动分组照片
  const albumGroups = useMemo(() => {
    const groups: { activity: typeof data.activities[0]; photos: typeof data.photos }[] = []
    
    // 获取有照片的活动
    const activityIds = [...new Set(data.photos.map(p => p.activityId))]
    activityIds.forEach(actId => {
      const activity = data.activities.find(a => a.id === actId)
      if (activity) {
        groups.push({
          activity,
          photos: data.photos.filter(p => p.activityId === actId),
        })
      }
    })
    
    return groups.sort((a, b) => b.activity.date.localeCompare(a.activity.date))
  }, [data.photos, data.activities])

  return (
    <div className="page-container space-y-5">
      <div className="text-center">
        <h1 className="page-title">📸 活动相册</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data.photos.length} 张精彩照片
        </p>
      </div>

      {albumGroups.length > 0 ? (
        albumGroups.map(group => {
          const cat = ACTIVITY_CATEGORIES[group.activity.category]
          return (
            <div key={group.activity.id} className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cat?.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{group.activity.title}</p>
                  <p className="text-[10px] text-gray-400">{group.activity.date}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
                {group.photos.map(photo => (
                  <div key={photo.id} className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })
      ) : (
        <div className="text-center py-16 text-gray-400">
          <ImageIcon className="w-16 h-16 mx-auto mb-3 text-gray-200" />
          <p className="text-lg font-semibold text-gray-500 mb-1">还没有照片</p>
          <p className="text-sm">在活动详情页上传第一张照片吧！</p>
        </div>
      )}
    </div>
  )
}
