"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartSearch } from "./_components/part-search";
import { RiskIndicator } from "./_components/risk-indicator";
import type { DigiKeyProduct } from "@/app/_lib/vendor/digikey/types";
import type { NormalizedCompliance, RiskLevel } from "./_lib/types";

// 一時的なプレースホルダー関数（後でドメインロジックに置き換え）
function getComplianceFromProduct(
  product: DigiKeyProduct
): NormalizedCompliance {
  const rohsStatus = product.Classifications?.RohsStatus || "";
  const reachStatus = product.Classifications?.ReachStatus || "";

  // 簡易的な正規化（後でnormalize-compliance.tsに置き換え）
  const rohs: NormalizedCompliance["rohs"] = rohsStatus.includes("Compliant")
    ? "Compliant"
    : rohsStatus.includes("Non-Compliant") || rohsStatus.includes("NonCompliant")
    ? "NonCompliant"
    : "Unknown";

  const reach: NormalizedCompliance["reach"] = reachStatus.includes("Unaffected") ||
    reachStatus.includes("Compliant")
    ? "Compliant"
    : reachStatus.includes("Affected")
    ? "NonCompliant"
    : "Unknown";

  return { rohs, reach };
}

function getRiskLevel(compliance: NormalizedCompliance): RiskLevel {
  // 簡易的な評価（後でevaluate-risk.tsに置き換え）
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
}

export default function RiskAssessmentPage() {
  const [selectedPart, setSelectedPart] = useState<DigiKeyProduct | null>(null);

  const compliance = selectedPart
    ? getComplianceFromProduct(selectedPart)
    : null;
  const riskLevel = compliance ? getRiskLevel(compliance) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">規制リスク評価・代替品提案</h1>
        <p className="text-sm text-muted-foreground">
          キーワードで部品を検索し、規制リスクと代替候補を確認できます
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {/* 検索セクション */}
        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-base">部品検索</CardTitle>
          </CardHeader>
          <CardContent>
            <PartSearch
              onPartSelect={setSelectedPart}
              selectedPart={selectedPart}
            />
          </CardContent>
        </Card>

        {/* 選択部品情報と代替候補 */}
        {selectedPart && compliance && riskLevel && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 選択部品情報 */}
            <Card className="flex flex-col min-h-0">
              <CardHeader>
                <CardTitle className="text-base">選択部品情報</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 space-y-4 overflow-y-auto">
                {/* 画像 */}
                {selectedPart.PhotoUrl && (
                  <div className="flex justify-center">
                    <img
                      src={selectedPart.PhotoUrl}
                      alt={selectedPart.ManufacturerProductNumber}
                      className="w-32 h-32 object-contain border rounded"
                    />
                  </div>
                )}

                {/* 基本情報 */}
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">MPN:</span>
                    <div className="font-medium">
                      {selectedPart.ManufacturerProductNumber}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      メーカー:
                    </span>
                    <div className="font-medium">
                      {selectedPart.Manufacturer?.Name}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">説明:</span>
                    <div className="text-sm">
                      {selectedPart.Description?.ProductDescription}
                    </div>
                  </div>
                  {selectedPart.QuantityAvailable > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        在庫:
                      </span>
                      <div className="text-sm">
                        {selectedPart.QuantityAvailable.toLocaleString()}個
                      </div>
                    </div>
                  )}
                </div>

                {/* 規制リスク */}
                <RiskIndicator compliance={compliance} riskLevel={riskLevel} />

                {/* 主要仕様（プレースホルダー） */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-sm font-medium">主要仕様</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      カテゴリ:{" "}
                      {selectedPart.Category?.Name || "情報なし"}
                    </div>
                    {/* パラメータから主要仕様を抽出（簡易版） */}
                    {selectedPart.Parameters?.slice(0, 3).map((param, idx) => (
                      <div key={idx}>
                        {param.ParameterText}: {param.ValueText}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 代替候補リスト */}
            <Card className="flex flex-col min-h-0">
              <CardHeader>
                <CardTitle className="text-base">代替候補リスト</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-y-auto">
                <div className="text-sm text-muted-foreground text-center py-8">
                  代替候補の検索機能は実装中です
                  <br />
                  （Phase 2のドメインロジック実装後に表示されます）
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 部品未選択時のメッセージ */}
        {!selectedPart && (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center text-muted-foreground">
              <p className="text-sm">
                上記の検索バーで部品を検索し、結果から部品を選択してください
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
