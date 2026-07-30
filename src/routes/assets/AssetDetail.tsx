import { useEffect } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { Check, Download, FileAudio, FileText, Image as ImageIcon, Lock, Video, X } from 'lucide-react'
import { AiPanel } from '@/components/common/AiPanel'
import { DocCode, MetaItem, PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mediaType, metadataStatus, securityLevel, tagReviewStatus, tagSource } from '@/lib/enums'
import { formatBytes, formatDate, formatDuration } from '@/lib/format'
import { can } from '@/lib/permissions'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { assetPermission, orgName, userName } from '@/mock/selectors'
import type { MediaType } from '@/mock/types'

const ICON_BY_TYPE: Record<MediaType, typeof FileText> = {
  DOCUMENT: FileText,
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: FileAudio,
}

export function AssetDetail() {
  const { id = '' } = useParams()
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()

  const asset = db.media_assets.find((item) => item.id === id)
  const permission = asset && user ? assetPermission(db, user.role, asset.security_level) : null

  useEffect(() => {
    if (asset && permission && !permission.can_view) {
      store.logAssetAccess(asset.id, 'DENIED')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.id, permission?.can_view])

  if (!asset || !user || !permission) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy tài nguyên.</p>
  }

  const tags = db.asset_tags.filter((item) => item.asset_id === asset.id)
  const accessLogs = db.asset_access_logs
    .filter((item) => item.asset_id === asset.id)
    .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))
  const Icon = ICON_BY_TYPE[asset.media_type]
  const canManage = can(user.role, 'e6.asset.manage')

  if (!permission.can_view) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <Lock className="text-muted-foreground mx-auto size-8" aria-hidden />
        <p className="mt-3 text-sm font-medium">Không có quyền xem tài nguyên này</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Vai trò {user.role} không có quyền xem tài nguyên ở mức bảo mật{' '}
          {securityLevel[asset.security_level].label}.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        module="E6"
        backTo="/kho-du-lieu"
        backLabel="Kho dữ liệu"
        title={asset.display_name}
        description={`${mediaType[asset.media_type].label} · ${formatBytes(asset.size_bytes)} · ${orgName(db, asset.owner_org_id)}`}
        actions={<StatusBadge meta={securityLevel[asset.security_level]} />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-4" aria-hidden />
                Xem trước
              </CardTitle>
              {permission.can_download ? (
                <Button
                  size="sm"
                  onClick={() => {
                    store.logAssetAccess(asset.id, 'DOWNLOAD')
                    toast.success('Đã tải tài nguyên (giả lập).')
                  }}
                >
                  <Download className="size-4" />
                  Tải về
                </Button>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Lock className="size-3.5" /> Không có quyền tải
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 text-muted-foreground flex h-40 items-center justify-center rounded border text-sm">
                Xem trước {mediaType[asset.media_type].label.toLowerCase()} (giả lập)
              </div>
              {asset.extracted_text && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    Văn bản trích xuất ({asset.media_type === 'AUDIO' || asset.media_type === 'VIDEO' ? 'STT' : 'OCR'})
                  </p>
                  <p className="bg-muted/30 rounded border p-3 text-sm leading-6 whitespace-pre-line">
                    {asset.extracted_text}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {canManage && !asset.extracted_text && (asset.media_type === 'IMAGE' || asset.media_type === 'AUDIO' || asset.media_type === 'VIDEO') && (
            <AiPanel kind="extract_text" inputId={asset.id} />
          )}

          {canManage && <AiPanel kind="tag_asset" inputId={asset.id} />}

          {tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nhãn gắn kèm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tags.map((assetTag) => {
                  const tag = db.tags.find((item) => item.id === assetTag.tag_id)
                  if (!tag) return null
                  return (
                    <div key={tag.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{tag.name}</span>
                        <StatusBadge meta={tagSource[assetTag.source]} dot={false} />
                        <StatusBadge meta={tagReviewStatus[assetTag.review_status]} />
                      </div>
                      {canManage && assetTag.review_status === 'PENDING_REVIEW' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              store.reviewAssetTag(asset.id, tag.id, true)
                              toast.success(`Đã xác nhận nhãn "${tag.name}".`)
                            }}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              store.reviewAssetTag(asset.id, tag.id, false)
                              toast.success(`Đã loại nhãn "${tag.name}".`)
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <MetaItem label="Loại">{mediaType[asset.media_type].label}</MetaItem>
              <MetaItem label="MIME type">
                <span className="font-mono text-xs">{asset.mime_type}</span>
              </MetaItem>
              <MetaItem label="Dung lượng">{formatBytes(asset.size_bytes)}</MetaItem>
              {asset.resolution && <MetaItem label="Độ phân giải">{asset.resolution}</MetaItem>}
              {asset.duration_seconds && <MetaItem label="Thời lượng">{formatDuration(asset.duration_seconds)}</MetaItem>}
              <MetaItem label="Trạng thái metadata">
                <StatusBadge meta={metadataStatus[asset.metadata_status]} />
              </MetaItem>
              <MetaItem label="Tổ chức sở hữu">{orgName(db, asset.owner_org_id)}</MetaItem>
              <MetaItem label="Người tải lên">{userName(db, asset.uploaded_by_id)}</MetaItem>
              <MetaItem label="Ngày tải lên">{formatDate(asset.created_at)}</MetaItem>
              <MetaItem label="Mã lưu trữ">
                <DocCode>{asset.storage_path}</DocCode>
              </MetaItem>
            </CardContent>
          </Card>

          {canManage && accessLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nhật ký truy cập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {accessLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{userName(db, log.user_id)}</span>
                    <span
                      className={
                        log.action === 'DENIED' ? 'text-[#8f0e22] text-xs font-medium' : 'text-muted-foreground text-xs'
                      }
                    >
                      {log.action === 'VIEW' ? 'Xem' : log.action === 'DOWNLOAD' ? 'Tải về' : 'Bị từ chối'} ·{' '}
                      {formatDate(log.occurred_at)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
