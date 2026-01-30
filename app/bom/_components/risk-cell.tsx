"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { BOMRowWithRisk } from "../_lib/types";

const riskLevelConfig: Record<
  BOMRowWithRisk["リスク"],
  { label: string; className: string }
> = {
  High: {
    label: "High",
    className: "bg-red-500 text-white border-red-600",
  },
  Medium: {
    label: "Medium",
    className: "bg-amber-500 text-white border-amber-600",
  },
  Low: {
    label: "Low",
    className: "bg-green-500 text-white border-green-600",
  },
  取得中: {
    label: "取得中",
    className: "bg-slate-400 text-white border-slate-500",
  },
  取得失敗: {
    label: "取得失敗",
    className: "bg-slate-600 text-white border-slate-700",
  },
};

interface RiskCellProps {
  row: BOMRowWithRisk;
}

/**
 * リスクセル：High/Medium/Low+色で表示し、
 * クリックで判断根拠（RoHS/REACH/ライフサイクル/代替候補）を表示
 */
export function RiskCell({ row }: RiskCellProps) {
  const risk = row.リスク;
  const config = riskLevelConfig[risk];

  const substituteText =
    row.代替候補有無 === "あり" && row.代替候補件数 != null
      ? `${row.代替候補有無}（${row.代替候補件数}件）`
      : row.代替候補有無;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="クリックでリスクの理由を表示"
          className={`inline-flex cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${config.className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {config.label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3 text-sm"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <p className="font-medium text-xs text-muted-foreground">
            リスクの理由
          </p>
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">RoHS</dt>
              <dd>{row.rohsStatus}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">REACH</dt>
              <dd>{row.reachStatus}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">ライフサイクル</dt>
              <dd>{row.lifecycleStatus}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">代替・類似候補</dt>
              <dd>{substituteText}</dd>
            </div>
          </dl>
          <p className="pt-1 text-xs text-muted-foreground">
            詳細はリスク評価画面で確認できます。
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
