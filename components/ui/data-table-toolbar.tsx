import { Table } from "@tanstack/react-table"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CsvColumnConfig } from "./data-table"
import { generateCSV, downloadCSV, generateCSVFilename } from "@/app/_lib/csv-utils"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  enableCsvExport?: boolean
  csvFilenamePrefix?: string
  csvColumnAccessors?: CsvColumnConfig<TData>[]
  data: TData[]
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  enableCsvExport = false,
  csvFilenamePrefix = "data",
  csvColumnAccessors,
  data,
}: DataTableToolbarProps<TData>) {
  const state = table.getState()
  const isFiltered = (state.columnFilters?.length ?? 0) > 0 || 
    (state.globalFilter as string)?.length > 0

  const handleCsvExport = () => {
    if (!csvColumnAccessors || csvColumnAccessors.length === 0) {
      // csvColumnAccessorsが指定されていない場合は、表示カラムから自動生成
      const visibleColumns = table.getVisibleLeafColumns()
      const headers: string[] = []
      const accessors: Array<(row: TData) => unknown> = []

      for (const column of visibleColumns) {
        // columnDefを Record<string, unknown> としてアクセス
        const columnDef = column.columnDef as unknown as Record<string, unknown>
        const header = columnDef.header
        const accessorKey = columnDef.accessorKey as string | undefined
        const accessorFn = columnDef.accessorFn as ((row: TData) => unknown) | undefined

        // ヘッダーが文字列の場合はそのまま使用、React要素の場合はaccessorKeyから推測
        if (typeof header === "string") {
          headers.push(header)
        } else if (accessorKey) {
          // accessorKeyからヘッダー名を推測（キャメルケースをスペース区切りに変換）
          headers.push(
            accessorKey
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .trim()
          )
        } else {
          headers.push(String(column.id))
        }

        // アクセサー関数を作成
        if (accessorFn) {
          accessors.push(accessorFn)
        } else if (accessorKey) {
          const key = accessorKey as keyof TData
          accessors.push((row: TData) => row[key])
        } else {
          accessors.push(() => "")
        }
      }

      // CSVデータを生成
      const rows = data.map((row) => accessors.map((accessor) => accessor(row)))
      const csvContent = generateCSV(headers, rows)
      const filename = generateCSVFilename(csvFilenamePrefix)
      downloadCSV(filename, csvContent)
    } else {
      // csvColumnAccessorsが指定されている場合はそれを使用
      const headers = csvColumnAccessors.map((config) => config.header)
      const rows = data.map((row) =>
        csvColumnAccessors.map((config) => {
          if (typeof config.accessor === "function") {
            return config.accessor(row)
          } else {
            return row[config.accessor]
          }
        })
      )
      const csvContent = generateCSV(headers, rows)
      const filename = generateCSVFilename(csvFilenamePrefix)
      downloadCSV(filename, csvContent)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey ? (
          <Input
            placeholder={`${searchKey}で検索...`}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-7 w-[150px] lg:w-[250px] text-xs"
          />
        ) : (
          <Input
            placeholder="すべての列で検索..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(event.target.value)
            }
            className="h-7 w-[150px] lg:w-[250px] text-xs"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter("")
            }}
            className="h-7 px-2 lg:px-3 text-xs"
          >
            リセット
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
        {enableCsvExport && (
          <Button
            variant="outline"
            onClick={handleCsvExport}
            className="h-7 px-2 lg:px-3 text-xs"
          >
            <Download className="mr-1 h-3 w-3" />
            CSVダウンロード
          </Button>
        )}
      </div>
    </div>
  )
}
