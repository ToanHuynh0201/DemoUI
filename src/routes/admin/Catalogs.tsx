import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { localityLevel, tagType } from '@/lib/enums'
import { useDb } from '@/mock/store'

/** E0 — danh mục dùng chung: chủ đề, địa phương, thẻ gắn nhãn. */
export function Catalogs() {
  const db = useDb()

  return (
    <div className="space-y-5">
      <PageHeader module="E0" title="Danh mục dùng chung" description="Lĩnh vực, địa phương và nhãn gắn cho tài nguyên số." />

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">Lĩnh vực ({db.topics.length})</TabsTrigger>
          <TabsTrigger value="localities">Địa phương ({db.localities.length})</TabsTrigger>
          <TabsTrigger value="tags">Nhãn ({db.tags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danh mục lĩnh vực</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {db.topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <span>{topic.name}</span>
                  <span className="text-muted-foreground font-mono text-xs">{topic.code}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danh mục địa phương</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {db.localities.map((locality) => (
                <div key={locality.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <span>{locality.name}</span>
                  <StatusBadge meta={{ label: localityLevel[locality.level].label, tone: 'neutral' }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danh mục nhãn</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {db.tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <span>{tag.name}</span>
                  <StatusBadge meta={{ label: tagType[tag.tag_type].label, tone: 'neutral' }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
