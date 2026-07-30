import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'

export interface FacetFilter {
  /** Tên cột trong dữ liệu (accessorKey) */
  columnId: string
  label: string
  options: { value: string; label: string }[]
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  /** Ô tìm kiếm lọc trên cột này */
  searchColumn?: string
  searchPlaceholder?: string
  facets?: FacetFilter[]
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  /** Hiện nút xuất Excel giả lập */
  onExport?: () => void
  pageSize?: number
  toolbarExtra?: React.ReactNode
}

/**
 * Bảng dữ liệu dùng chung cho toàn bộ màn hình danh sách: sắp xếp, lọc nhanh
 * theo cột, tìm kiếm và phân trang. Mật độ dòng để hẹp theo phong cách bảng
 * biểu hành chính, ưu tiên xem được nhiều bản ghi trên một màn hình.
 */
export function DataTable<T>({
  data,
  columns,
  searchColumn,
  searchPlaceholder = 'Tìm kiếm...',
  facets = [],
  onRowClick,
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription = 'Không có bản ghi nào khớp với bộ lọc hiện tại.',
  onExport,
  pageSize = 12,
  toolbarExtra,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalSearch, setGlobalSearch] = useState('')
  const [facetValues, setFacetValues] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const record = row as Record<string, unknown>
      if (searchColumn && globalSearch.trim()) {
        const value = String(record[searchColumn] ?? '').toLowerCase()
        if (!value.includes(globalSearch.trim().toLowerCase())) return false
      }
      return Object.entries(facetValues).every(([columnId, selected]) => {
        if (!selected || selected === '__all__') return true
        return String(record[columnId] ?? '') === selected
      })
    })
  }, [data, searchColumn, globalSearch, facetValues])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const hasToolbar = Boolean(searchColumn) || facets.length > 0 || Boolean(onExport) || Boolean(toolbarExtra)

  return (
    <div className="space-y-3">
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {searchColumn && (
            <div className="relative min-w-64 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 bg-card pl-8"
              />
            </div>
          )}
          {facets.map((facet) => (
            <Select
              key={facet.columnId}
              value={facetValues[facet.columnId] ?? '__all__'}
              onValueChange={(value) =>
                setFacetValues((previous) => ({ ...previous, [facet.columnId]: value }))
              }
            >
              <SelectTrigger className="h-9 w-auto min-w-40 bg-card">
                <SelectValue placeholder={facet.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{facet.label}: tất cả</SelectItem>
                {facet.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {toolbarExtra}
          {onExport && (
            <Button variant="outline" size="sm" className="ml-auto h-9" onClick={onExport}>
              <Download className="size-4" />
              Xuất Excel
            </Button>
          )}
        </div>
      )}

      <div className="bg-card overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/60 hover:bg-muted/60">
                  {headerGroup.headers.map((header) => {
                    const sortable = header.column.getCanSort()
                    return (
                      <TableHead
                        key={header.id}
                        className="text-foreground h-10 text-xs font-semibold tracking-wide whitespace-nowrap uppercase"
                      >
                        {header.isPlaceholder ? null : sortable ? (
                          <button
                            type="button"
                            className="hover:text-primary inline-flex items-center gap-1"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowUpDown className="size-3 opacity-50" />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn('align-top', onRowClick && 'hover:bg-accent/60 cursor-pointer')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {table.getPageCount() > 1 && (
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span className="tabular">
            {filtered.length} bản ghi · trang {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
