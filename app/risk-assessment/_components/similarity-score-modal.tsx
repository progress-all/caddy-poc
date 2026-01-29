"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { CandidateDetailedInfo } from "../_lib/types";

interface SimilarityScoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetProduct: CandidateDetailedInfo;
  candidate: CandidateDetailedInfo;
}

/**
 * 類似度スコア内訳モーダル
 * TargetとCandidate部品の各パラメータを比較し、スコア内訳を表示
 */
export function SimilarityScoreModal({
  open,
  onOpenChange,
  targetProduct,
  candidate,
}: SimilarityScoreModalProps) {
  const breakdown = candidate.similarityBreakdown || [];
  const totalScore = candidate.similarityScore ?? 0;

  // 件数サマリーを計算
  const summary = useMemo(() => {
    const compared = breakdown.filter((item) => item.status === "compared").length;
    const notComparable = breakdown.filter(
      (item) => item.status === "target_only" || item.status === "candidate_only"
    ).length;
    const bothMissing = breakdown.filter(
      (item) => item.status === "both_missing"
    ).length;
    const excluded = breakdown.filter(
      (item) => item.status === "excluded"
    ).length;

    return { compared, notComparable, bothMissing, excluded };
  }, [breakdown]);

  // スコアに応じた色を決定
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getResultBadge = (
    status: string,
    matched: boolean,
    score: number,
    excludeReason?: string
  ) => {
    if (status === "excluded") {
      return {
        variant: "outline" as const,
        text: excludeReason ? `対象外（${excludeReason}）` : "対象外",
      };
    }
    if (status === "both_missing") {
      return {
        variant: "outline" as const,
        text: "データなし",
      };
    }
    if (status === "target_only") {
      return {
        variant: "secondary" as const,
        text: "比較不可 (候補に値なし)",
      };
    }
    if (status === "candidate_only") {
      return {
        variant: "secondary" as const,
        text: "比較不可 (Targetに値なし)",
      };
    }
    // status === "compared"
    if (matched) {
      return { variant: "default" as const, text: "OK" };
    }
    if (score >= 50) {
      return { variant: "secondary" as const, text: "部分一致" };
    }
    return { variant: "destructive" as const, text: "NG" };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>類似度スコア内訳</DialogTitle>
        </DialogHeader>

        {/* 固定領域: 製品情報とスコア */}
        <div className="space-y-4 flex-shrink-0 pb-4">
          {/* 製品情報ヘッダー */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Target
                </div>
                <div className="text-base font-semibold">
                  {targetProduct.manufacturerProductNumber}
                </div>
                <div className="text-xs text-muted-foreground">
                  {targetProduct.manufacturerName}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Candidate
                </div>
                <div className="text-base font-semibold">
                  {candidate.manufacturerProductNumber}
                </div>
                <div className="text-xs text-muted-foreground">
                  {candidate.manufacturerName}
                </div>
              </div>
            </div>
          </div>

          {/* トータルスコア */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Score</span>
              <span
                className={`text-lg font-bold ${getScoreColor(totalScore)}`}
              >
                {totalScore} / 100
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getScoreBgColor(totalScore)}`}
                style={{ width: `${totalScore}%` }}
              />
            </div>
            {/* 件数サマリー */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                比較済み: <span className="font-medium">{summary.compared}</span>
              </span>
              <span>
                比較不可: <span className="font-medium">{summary.notComparable}</span>
              </span>
              <span>
                データなし: <span className="font-medium">{summary.bothMissing}</span>
              </span>
              <span>
                対象外: <span className="font-medium">{summary.excluded}</span>
              </span>
            </div>
          </div>
        </div>

        {/* スクロール領域: テーブル */}
        {breakdown.length > 0 ? (
          <div className="flex-1 overflow-auto border rounded-lg min-h-0">
            <div className="text-sm font-medium px-4 py-2 border-b bg-muted/30">
              パラメータ比較
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium bg-muted/50">
                      Parameter
                    </th>
                    <th className="px-4 py-2 text-left font-medium bg-muted/50">
                      Target
                    </th>
                    <th className="px-4 py-2 text-left font-medium bg-muted/50">
                      Candidate
                    </th>
                    <th className="px-4 py-2 text-center font-medium w-48 bg-muted/50">
                      Result
                    </th>
                    <th className="px-4 py-2 text-center font-medium w-24 bg-muted/50">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((item, index) => {
                    // parameterIdから元のパラメータIDを抽出
                    const paramId = item.parameterId.includes(":")
                      ? item.parameterId.split(":")[1]
                      : item.parameterId;
                    const resultBadge = getResultBadge(
                      item.status,
                      item.matched,
                      item.score,
                      item.excludeReason
                    );
                    return (
                      <tr
                        key={item.parameterId}
                        className={`border-t ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/10"
                        }`}
                      >
                        <td className="px-4 py-2">
                          <div className="space-y-0.5">
                            <div className="font-medium">{paramId}</div>
                            <div className="text-xs text-muted-foreground font-normal leading-tight">
                              {item.displayName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {item.targetValue ?? "-"}
                        </td>
                        <td className="px-4 py-2">
                          {item.candidateValue ?? "-"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Badge
                            variant={resultBadge.variant}
                            className="text-xs"
                          >
                            {resultBadge.text}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {item.status === "compared" ? (
                            <span
                              className={`font-medium ${getScoreColor(
                                item.score
                              )}`}
                            >
                              {item.score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>スコア内訳データがありません</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
