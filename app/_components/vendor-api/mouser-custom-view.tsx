"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { MouserSearchResults, MouserPart } from "@/app/_lib/vendor/mouser/types";

interface MouserCustomViewProps {
  data: unknown;
}

interface KeyValueTagsProps {
  items: unknown[];
  formatFn?: (item: unknown) => string;
}

function KeyValueTags({ items, formatFn }: KeyValueTagsProps) {
  if (!Array.isArray(items) || items.length === 0) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  // 最大2つまでのバッジを表示
  const displayItems = items.slice(0, 2);
  const hasMore = items.length > 2;

  return (
    <div className="flex flex-wrap gap-0.5 max-h-[2.5rem] overflow-hidden">
      {displayItems.map((item, index) => {
        let displayText: string;
        
        if (formatFn) {
          displayText = formatFn(item);
        } else if (typeof item === "object" && item !== null) {
          // オブジェクトの場合は主要なkey:valueペアを抽出
          const entries = Object.entries(item);
          if (entries.length > 0) {
            displayText = entries
              .slice(0, 2) // 最大2つのペアまで表示
              .map(([key, value]) => {
                const val = value === null || value === undefined ? "-" : String(value);
                return `${key}: ${val}`;
              })
              .join(", ");
          } else {
            displayText = JSON.stringify(item);
          }
        } else {
          displayText = String(item);
        }

        // テキストを短縮
        if (displayText.length > 30) {
          displayText = displayText.substring(0, 30) + "...";
        }

        return (
          <Badge key={index} variant="secondary" className="text-[10px] px-1 py-0 h-4 leading-4">
            {displayText}
          </Badge>
        );
      })}
      {hasMore && (
        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 leading-4">
          +{items.length - 2}
        </Badge>
      )}
    </div>
  );
}

function formatProductAttribute(item: unknown): string {
  if (typeof item === "object" && item !== null) {
    const attr = item as { AttributeName?: string; AttributeValue?: string };
    if (attr.AttributeName && attr.AttributeValue !== undefined) {
      return `${attr.AttributeName}: ${attr.AttributeValue}`;
    }
  }
  return JSON.stringify(item);
}

function formatPriceBreak(item: unknown): string {
  if (typeof item === "object" && item !== null) {
    const pb = item as {
      Quantity?: number;
      Price?: string;
      Currency?: string;
    };
    const parts: string[] = [];
    if (pb.Quantity !== undefined) parts.push(`Qty: ${pb.Quantity}`);
    if (pb.Price) {
      const price = pb.Currency ? `${pb.Currency} ${pb.Price}` : pb.Price;
      parts.push(`Price: ${price}`);
    }
    return parts.length > 0 ? parts.join(", ") : JSON.stringify(item);
  }
  return JSON.stringify(item);
}

function renderCellValue(
  value: unknown,
  fieldName: string
): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const text = String(value);
    return (
      <div className="text-xs line-clamp-2 max-w-xs" title={text}>
        {text}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (fieldName === "ProductAttributes") {
      return <KeyValueTags items={value} formatFn={formatProductAttribute} />;
    }
    if (fieldName === "PriceBreaks") {
      return <KeyValueTags items={value} formatFn={formatPriceBreak} />;
    }
    return <KeyValueTags items={value} />;
  }

  if (typeof value === "object") {
    return <KeyValueTags items={[value]} />;
  }

  const text = JSON.stringify(value);
  return (
    <div className="text-xs line-clamp-2 max-w-xs" title={text}>
      {text}
    </div>
  );
}

// ラベルを生成（キャメルケースをスペース区切りに変換）
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function MouserCustomView({ data }: MouserCustomViewProps) {
  // データの型チェックとParts配列の抽出
  const searchResults = data as MouserSearchResults;
  const parts = searchResults?.SearchResults?.Parts;

  if (!parts || parts.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>検索結果が見つかりませんでした。</p>
      </div>
    );
  }

  // すべてのPartからすべてのキーを収集
  const allKeys = new Set<string>();
  parts.forEach((part) => {
    Object.keys(part).forEach((key) => allKeys.add(key));
  });

  // キーを配列に変換してソート（一部の重要なキーを先頭に配置）
  const priorityKeys = [
    "MouserPartNumber",
    "ManufacturerPartNumber",
    "Manufacturer",
    "Description",
    "Availability",
    "LifecycleStatus",
  ];
  
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    const aPriority = priorityKeys.indexOf(a);
    const bPriority = priorityKeys.indexOf(b);
    
    // 両方が優先キーの場合
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    }
    // aのみが優先キーの場合
    if (aPriority !== -1) return -1;
    // bのみが優先キーの場合
    if (bPriority !== -1) return 1;
    // 両方とも優先キーでない場合はアルファベット順
    return a.localeCompare(b);
  });

  // 列定義を作成
  const columns: ColumnDef<MouserPart>[] = sortedKeys.map((key) => ({
    accessorKey: key,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={formatLabel(key)}
      />
    ),
    cell: ({ row }) => {
      const value = (row.original as Record<string, unknown>)[key];
      return (
        <div className="max-h-[2.5rem] overflow-hidden">
          {renderCellValue(value, key)}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  }));

  return (
    <div className="h-full min-h-[500px] flex flex-col">
      <DataTable
        columns={columns}
        data={parts}
        searchKey="MouserPartNumber"
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        enableColumnVisibility={true}
        pageSize={100}
      />
    </div>
  );
}
