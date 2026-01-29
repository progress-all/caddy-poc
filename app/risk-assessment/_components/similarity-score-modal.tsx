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

    return { compared, notComparable, bothMissing };
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
    score: number
  ) => {
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

        <div className="flex-1 overflow-y-auto space-y-6">
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
            </div>
          </div>

          {/* パラメータ比較テーブル */}
          {breakdown.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">パラメータ比較</div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">
                          Parameter
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Target
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Candidate
                        </th>
                        <th className="px-4 py-2 text-center font-medium w-48">
                          Result
                        </th>
                        <th className="px-4 py-2 text-center font-medium w-24">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.map((item, index) => {
                        // parameterIdから元のパラメータ名を抽出
                        const paramName = item.parameterId.includes(":")
                          ? item.parameterId.split(":")[1]
                          : item.parameterId;
                        const resultBadge = getResultBadge(
                          item.status,
                          item.matched,
                          item.score
                        );
                        return (
                          <tr
                            key={item.parameterId}
                            className={`border-t ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/10"
                            }`}
                          >
                            <td className="px-4 py-2 font-medium">
                              {paramName}
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
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>スコア内訳データがありません</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
