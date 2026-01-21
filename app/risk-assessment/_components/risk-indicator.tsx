"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskLevel, NormalizedCompliance } from "../_lib/types";
import { cn } from "@/app/_lib/utils";

interface RiskIndicatorProps {
  compliance: NormalizedCompliance;
  riskLevel: RiskLevel;
  className?: string;
}

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

const complianceStatusConfig: Record<
  NormalizedCompliance["rohs"] | NormalizedCompliance["reach"],
  { label: string; icon: string }
> = {
  Compliant: { label: "Compliant", icon: "✅" },
  NonCompliant: { label: "Non-Compliant", icon: "❌" },
  Unknown: { label: "Unknown", icon: "⚠️" },
};

export function RiskIndicator({
  compliance,
  riskLevel,
  className,
}: RiskIndicatorProps) {
  const riskConfig = riskLevelConfig[riskLevel];
  const rohsConfig = complianceStatusConfig[compliance.rohs];
  const reachConfig = complianceStatusConfig[compliance.reach];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-base">規制リスク</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* RoHSステータス */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">RoHS:</span>
          <div className="flex items-center gap-2">
            <span>{rohsConfig.icon}</span>
            <span className="text-sm">{rohsConfig.label}</span>
          </div>
        </div>

        {/* REACHステータス */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">REACH:</span>
          <div className="flex items-center gap-2">
            <span>{reachConfig.icon}</span>
            <span className="text-sm">{reachConfig.label}</span>
          </div>
        </div>

        {/* リスクレベル */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">リスク:</span>
          <Badge className={cn("text-xs", riskConfig.className)}>
            {riskConfig.icon} {riskConfig.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
