"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import type { BOMRowWithRisk } from "./_lib/types";
import { RiskCell } from "./_components/risk-cell";


// 代替候補有無の表示ラベル
const substituteLabelMap: Record<BOMRowWithRisk["代替候補有無"], string> = {
  あり: "あり",
  なし: "なし",
  判定中: "判定中",
  取得失敗: "取得失敗",
};

export default function BOMPage() {
  const [bomData, setBomData] = useState<BOMRowWithRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [substituteFilter, setSubstituteFilter] = useState<
    "all" | "あり" | "なし" | "判定中" | "取得失敗"
  >("all");
  const [riskFilter, setRiskFilter] = useState<
    "all" | BOMRowWithRisk["リスク"]
  >("all");

  // BOMデータを内部APIから取得
  useEffect(() => {
    const loadBOMData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 内部APIからBOMデータを取得（デフォルトはbom）
        const response = await fetch("/api/bom?id=bom");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `BOMデータの取得に失敗しました: ${response.status}`
          );
        }

        const data: BOMRowWithRisk[] = await response.json();
        setBomData(data);
      } catch (err) {
        console.error("BOMデータ読み込みエラー:", err);
        setError(
          err instanceof Error ? err.message : "BOMデータの読み込みに失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBOMData();
  }, []);

  // リスクの高い順にソート（High → Medium → Low → 取得中 → 取得失敗）
  const sortedData = useMemo(() => {
    const riskOrder: Record<BOMRowWithRisk["リスク"], number> = {
      High: 0,
      Medium: 1,
      Low: 2,
      取得中: 3,
      取得失敗: 4,
    };

    return [...bomData].sort((a, b) => {
      const orderDiff = riskOrder[a.リスク] - riskOrder[b.リスク];
      if (orderDiff !== 0) return orderDiff;
      // 同一リスク内では部品型番順
      return a.部品型番.localeCompare(b.部品型番);
    });
  }, [bomData]);

  // BOMに存在する値だけをフィルタオプションに表示
  const availableSubstituteOptions = useMemo(() => {
    const order: Record<BOMRowWithRisk["代替候補有無"], number> = {
      あり: 0,
      なし: 1,
      判定中: 2,
      取得失敗: 3,
    };
    const values = [...new Set(sortedData.map((r) => r.代替候補有無))].sort(
      (a, b) => order[a] - order[b]
    );
    return [
      { value: "all" as const, label: "すべて" },
      ...values.map((v) => ({ value: v, label: substituteLabelMap[v] })),
    ];
  }, [sortedData]);

  const availableRiskOptions = useMemo(() => {
    const riskOrder: Record<BOMRowWithRisk["リスク"], number> = {
      High: 0,
      Medium: 1,
      Low: 2,
      取得中: 3,
      取得失敗: 4,
    };
    const values = [...new Set(sortedData.map((r) => r.リスク))].sort(
      (a, b) => riskOrder[a] - riskOrder[b]
    );
    return [
      { value: "all" as const, label: "すべて" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [sortedData]);

  // 選択中の値がBOMに存在しなければ「すべて」にリセット
  useEffect(() => {
    const subExists = availableSubstituteOptions.some((o) => o.value === substituteFilter);
    if (!subExists) setSubstituteFilter("all");
  }, [availableSubstituteOptions, substituteFilter]);
  useEffect(() => {
    const riskExists = availableRiskOptions.some((o) => o.value === riskFilter);
    if (!riskExists) setRiskFilter("all");
  }, [availableRiskOptions, riskFilter]);

  // 代替候補有無・リスクでフィルタ（Excel風）
  const filteredData = useMemo(() => {
    let result = sortedData;
    if (substituteFilter !== "all") {
      result = result.filter((row) => row.代替候補有無 === substituteFilter);
    }
    if (riskFilter !== "all") {
      result = result.filter((row) => row.リスク === riskFilter);
    }
    return result;
  }, [sortedData, substituteFilter, riskFilter]);

  // テーブルの列定義（リスクを起点に左配置、理由はクリックで表示）
  const columns: ColumnDef<BOMRowWithRisk>[] = [
    {
      accessorKey: "リスク",
      header: "リスク",
      cell: ({ row }) => <RiskCell row={row.original} />,
    },
    {
      accessorKey: "部品型番",
      header: "部品型番",
      cell: ({ row }) => (
        <Link
          href={`/risk-assessment?keyword=${encodeURIComponent(row.original.部品型番)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sm text-primary hover:underline"
        >
          {row.original.部品型番}
        </Link>
      ),
    },
    {
      accessorKey: "メーカー",
      header: "メーカー",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.メーカー}</div>
      ),
    },
    {
      accessorKey: "カテゴリ",
      header: "カテゴリ",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.カテゴリ}</div>
      ),
    },
    {
      accessorKey: "サブシステム",
      header: "サブシステム",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.サブシステム}</div>
      ),
    },
    {
      accessorKey: "rohsStatus",
      header: "RoHS",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.rohsStatus}</div>
      ),
    },
    {
      accessorKey: "reachStatus",
      header: "REACH",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.reachStatus}</div>
      ),
    },
    {
      accessorKey: "lifecycleStatus",
      header: "ライフサイクル",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.lifecycleStatus}</div>
      ),
    },
    {
      accessorKey: "代替候補有無",
      header: "代替・類似候補",
      cell: ({ row }) => {
        const hasSubs = row.original.代替候補有無;
        const count = row.original.代替候補件数;
        if (hasSubs === "あり" && count !== undefined) {
          return (
            <div className="text-sm">
              {hasSubs}（{count}件）
            </div>
          );
        }
        return <div className="text-sm">{hasSubs}</div>;
      },
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">BOM一覧</h1>
        <p className="text-sm text-muted-foreground">
          部品のリスク評価と代替候補の有無を表示します（リスクの高い順）
        </p>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              BOM一覧 ({filteredData.length}件)
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  代替候補有無:
                </span>
                <Select
                  value={substituteFilter}
                  onValueChange={(v) =>
                    setSubstituteFilter(
                      v as "all" | "あり" | "なし" | "判定中" | "取得失敗"
                    )
                  }
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                <SelectContent>
                  {availableSubstituteOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  リスク:
                </span>
                <Select
                  value={riskFilter}
                  onValueChange={(v) =>
                    setRiskFilter(v as "all" | BOMRowWithRisk["リスク"])
                  }
                >
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRiskOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[500px]">
              <p className="text-sm text-muted-foreground">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              <p className="font-medium">エラー</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="h-full min-h-[500px]">
              <DataTable
                columns={columns}
                data={filteredData}
                searchKey="部品型番"
                enableSorting={true}
                enableFiltering={true}
                enablePagination={true}
                enableColumnVisibility={true}
                pageSize={50}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
