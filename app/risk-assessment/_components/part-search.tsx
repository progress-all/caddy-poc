"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useSWRMutation from "swr/mutation";
import { searchByKeyword } from "@/app/_lib/vendor/digikey/api";
import type { KeywordSearchInput } from "@/app/_lib/vendor/digikey/types";
import type { DigiKeyProduct } from "@/app/_lib/vendor/digikey/types";
import type { NormalizedCompliance, RiskLevel } from "../_lib/types";
import { cn } from "@/app/_lib/utils";

interface PartSearchProps {
  onPartSelect: (product: DigiKeyProduct) => void;
  selectedPart: DigiKeyProduct | null;
}

export function PartSearch({ onPartSelect, selectedPart }: PartSearchProps) {
  const [keyword, setKeyword] = useState("LM358");

  const {
    data: searchResults,
    error: searchError,
    isMutating: isSearching,
    trigger: executeSearch,
    reset: resetSearch,
  } = useSWRMutation(
    ["digikey", "keyword", "risk-assessment"],
    (_key, { arg }: { arg: KeywordSearchInput }) => searchByKeyword(arg)
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!keyword.trim()) return;

      resetSearch();
      await executeSearch({
        keywords: keyword.trim(),
        limit: 25,
        offset: 0,
      });
    },
    [keyword, executeSearch, resetSearch]
  );

  const handlePartClick = useCallback(
    (product: DigiKeyProduct) => {
      onPartSelect(product);
    },
    [onPartSelect]
  );

  const products = searchResults?.Products ?? [];

  // 規制ステータス正規化（page.tsxと同じロジック）
  const getComplianceFromProduct = (
    product: DigiKeyProduct
  ): NormalizedCompliance => {
    const rohsStatus = product.Classifications?.RohsStatus || "";
    const reachStatus = product.Classifications?.ReachStatus || "";

    const rohs: NormalizedCompliance["rohs"] = rohsStatus.includes("Compliant")
      ? "Compliant"
      : rohsStatus.includes("Non-Compliant") ||
        rohsStatus.includes("NonCompliant")
      ? "NonCompliant"
      : "Unknown";

    const reach: NormalizedCompliance["reach"] =
      reachStatus.includes("Unaffected") || reachStatus.includes("Compliant")
        ? "Compliant"
        : reachStatus.includes("Affected")
        ? "NonCompliant"
        : "Unknown";

    return { rohs, reach };
  };

  // リスクレベル評価（page.tsxと同じロジック）
  const getRiskLevel = (compliance: NormalizedCompliance): RiskLevel => {
    if (
      compliance.rohs === "NonCompliant" ||
      compliance.reach === "NonCompliant"
    ) {
      return "High";
    }
    if (compliance.rohs === "Compliant" && compliance.reach === "Compliant") {
      return "Low";
    }
    return "Medium";
  };

  // リスクレベル設定
  const riskLevelConfig: Record<
    RiskLevel,
    { label: string; className: string; icon: string }
  > = {
    Low: {
      label: "Low",
      className: "bg-green-500 text-white border-green-600",
      icon: "✅",
    },
    Medium: {
      label: "Medium",
      className: "bg-yellow-500 text-white border-yellow-600",
      icon: "⚠️",
    },
    High: {
      label: "High",
      className: "bg-red-500 text-white border-red-600",
      icon: "❌",
    },
  };

  // 規制ステータス設定
  const complianceStatusConfig: Record<
    NormalizedCompliance["rohs"] | NormalizedCompliance["reach"],
    { label: string; icon: string }
  > = {
    Compliant: { label: "Compliant", icon: "✅" },
    NonCompliant: { label: "Non-Compliant", icon: "❌" },
    Unknown: { label: "Unknown", icon: "⚠️" },
  };

  return (
    <div className="space-y-4">
      {/* 検索フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="keyword" className="sr-only">
            キーワード検索
          </Label>
          <Input
            id="keyword"
            type="text"
            placeholder="例: LM358"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={isSearching}
            className="h-9"
          />
        </div>
        <Button type="submit" disabled={isSearching || !keyword.trim()}>
          {isSearching ? "検索中..." : "検索"}
        </Button>
      </form>

      {/* エラー表示 */}
      {searchError && (
        <div className="text-sm text-destructive">
          <strong>エラー:</strong> {searchError.message}
        </div>
      )}

      {/* 検索結果 */}
      {products.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            検索結果 ({products.length}件)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {products.map((product, index) => {
              const isSelected =
                selectedPart?.ManufacturerProductNumber ===
                product.ManufacturerProductNumber;
              const compliance = getComplianceFromProduct(product);
              const riskLevel = getRiskLevel(compliance);
              const riskConfig = riskLevelConfig[riskLevel];
              const rohsConfig = complianceStatusConfig[compliance.rohs];
              const reachConfig = complianceStatusConfig[compliance.reach];

              return (
                <Card
                  key={index}
                  className={cn(
                    "cursor-pointer transition-colors flex flex-col",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => handlePartClick(product)}
                >
                  <CardContent className="p-3 flex flex-col flex-1 space-y-2">
                    {/* ヘッダー: 画像 + MPN + メーカー */}
                    <div className="flex items-start gap-2">
                      {product.PhotoUrl && (
                        <img
                          src={product.PhotoUrl}
                          alt={product.ManufacturerProductNumber}
                          className="w-12 h-12 object-contain border rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {product.ManufacturerProductNumber}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {product.Manufacturer?.Name}
                        </div>
                      </div>
                    </div>

                    {/* カテゴリ */}
                    {product.Category?.Name && (
                      <div className="text-xs text-muted-foreground">
                        カテゴリ: {product.Category.Name}
                      </div>
                    )}

                    {/* 説明 */}
                    <div className="text-xs text-muted-foreground line-clamp-2 flex-1">
                      {product.Description?.ProductDescription}
                    </div>

                    {/* 規制情報 */}
                    <div className="space-y-1.5 pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">RoHS:</span>
                        <div className="flex items-center gap-1">
                          <span>{rohsConfig.icon}</span>
                          <span>{rohsConfig.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">REACH:</span>
                        <div className="flex items-center gap-1">
                          <span>{reachConfig.icon}</span>
                          <span>{reachConfig.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-muted-foreground">リスク:</span>
                        <Badge
                          className={cn("text-xs h-5", riskConfig.className)}
                        >
                          {riskConfig.icon} {riskConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* ステータスと在庫 */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t">
                      {product.ProductStatus?.Status && (
                        <span className="text-muted-foreground">
                          ステータス: {product.ProductStatus.Status}
                        </span>
                      )}
                      {product.QuantityAvailable != null &&
                        product.QuantityAvailable > 0 && (
                          <span className="text-muted-foreground">
                            在庫: {product.QuantityAvailable.toLocaleString()}個
                          </span>
                        )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 検索結果が0件の場合 */}
      {searchResults && products.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8">
          検索結果が見つかりませんでした
        </div>
      )}
    </div>
  );
}
