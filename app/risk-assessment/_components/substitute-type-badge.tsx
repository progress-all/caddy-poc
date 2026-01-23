"use client";

import { Badge } from "@/components/ui/badge";
import type { SubstituteType } from "../_lib/types";

/**
 * 代替品種別チップのプロパティ
 */
interface SubstituteTypeBadgeProps {
  /** 代替品種別 */
  type: SubstituteType | string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 代替品種別チップコンポーネント
 * APIの応答値をそのまま表示（ManufacturerRecommended, ParametricEquivalent, Similar等）
 */
export function SubstituteTypeBadge({
  type,
  className,
}: SubstituteTypeBadgeProps) {
  return (
    <Badge variant="outline" className={className}>
      {type || "Unknown"}
    </Badge>
  );
}

/**
 * DigiKey 代替品大分類チップのプロパティ
 */
interface DigiKeyBadgeProps {
  /** 追加のクラス名 */
  className?: string;
}

/**
 * DigiKey 代替品大分類チップコンポーネント
 * 青ベース（default variant）で表示
 */
export function DigiKeyBadge({ className }: DigiKeyBadgeProps) {
  return (
    <Badge variant="default" className={className}>
      DigiKey 代替品
    </Badge>
  );
}
