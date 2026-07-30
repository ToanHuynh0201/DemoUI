import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { FileAudio, FileText, Image as ImageIcon, Lock, Search, Video } from 'lucide-react'
import { AiPanel } from '@/components/common/AiPanel'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mediaType, securityLevel } from '@/lib/enums'
import { formatBytes, formatDate } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { assetPermission, topicName } from '@/mock/selectors'
import type { MediaType } from '@/mock/types'

const ICON_BY_TYPE: Record<MediaType, typeof FileText> = {
  DOCUMENT: FileText,
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: FileAudio,
}

/** E6 — kho tài nguyên số: lọc theo loại/lĩnh vực/bảo mật, tìm kiếm ngôn ngữ tự nhiên. */
export function AssetLibrary() {
  const db = useDb()
  const user = useCurrentUser()

  const [search, setSearch] = useState('')
  const [useAiSearch, setUseAiSearch] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('__all__')
  const [topicFilter, setTopicFilter] = useState<string>('__all__')
  const [securityFilter, setSecurityFilter] = useState<string>('__all__')

  const visibleAssets = useMemo(() => {
    if (!user) return []
    return db.media_assets.filter((asset) => assetPermission(db, user.role, asset.security_level).can_view)
  }, [db, user])

  const filtered = useMemo(() => {
    return visibleAssets.filter((asset) => {
      if (typeFilter !== '__all__' && asset.media_type !== typeFilter) return false
      if (topicFilter !== '__all__' && asset.topic_id !== topicFilter) return false
      if (securityFilter !== '__all__' && asset.security_level !== securityFilter) return false
      if (!search.trim()) return true
      const query = search.trim().toLowerCase()
      return (
        asset.display_name.toLowerCase().includes(query) ||
        (asset.extracted_text ?? '').toLowerCase().includes(query)
      )
    })
  }, [visibleAssets, typeFilter, topicFilter, securityFilter, search])

  return (
    <div className="space-y-5">
      <PageHeader
        module="E6"
        title="Kho dữ liệu truyền thông"
        description="Tài liệu, ảnh, video và âm thanh dùng chung, có metadata và kiểm soát truy cập theo mức bảo mật."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-72 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setUseAiSearch(event.target.value.trim().length > 3)
            }}
            placeholder="Tìm theo tên tệp, nội dung OCR/STT, hoặc mô tả bằng câu tự nhiên..."
            className="h-9 bg-card pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-auto min-w-36 bg-card">
            <SelectValue placeholder="Loại tài nguyên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Loại: tất cả</SelectItem>
            {(Object.keys(mediaType) as MediaType[]).map((key) => (
              <SelectItem key={key} value={key}>
                {mediaType[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="h-9 w-auto min-w-36 bg-card">
            <SelectValue placeholder="Lĩnh vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Lĩnh vực: tất cả</SelectItem>
            {db.topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={securityFilter} onValueChange={setSecurityFilter}>
          <SelectTrigger className="h-9 w-auto min-w-36 bg-card">
            <SelectValue placeholder="Mức bảo mật" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Bảo mật: tất cả</SelectItem>
            {(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'] as const).map((key) => (
              <SelectItem key={key} value={key}>
                {securityLevel[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {useAiSearch && <AiPanel kind="semantic_search" inputId={search} autoRun />}

      {filtered.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Không tìm thấy tài nguyên phù hợp" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => {
            const Icon = ICON_BY_TYPE[asset.media_type]
            const canDownload = user ? assetPermission(db, user.role, asset.security_level).can_download : false
            return (
              <Link
                key={asset.id}
                to={`/kho-du-lieu/${asset.id}`}
                className="bg-card hover:border-primary/40 group flex flex-col gap-2 rounded-md border p-3.5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <Icon className="text-primary size-5 shrink-0" aria-hidden />
                  <div className="flex gap-1.5">
                    <StatusBadge meta={securityLevel[asset.security_level]} dot={false} />
                    {!canDownload && <Lock className="text-muted-foreground size-3.5" aria-hidden />}
                  </div>
                </div>
                <p className="line-clamp-2 text-sm font-medium">{asset.display_name}</p>
                <p className="text-muted-foreground mt-auto text-xs">
                  {topicName(db, asset.topic_id)} · {formatBytes(asset.size_bytes)} · {formatDate(asset.created_at)}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
