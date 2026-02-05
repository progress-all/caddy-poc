import type { ParameterEvaluation } from "@/app/_lib/datasheet/similarity-schema";

/** 欠損・比較不能とみなす値のパターン（正規化後の完全一致） */
const MISSING_LITERALS = new Set([
  "-",
  "—",
  "n/a",
  "na",
  "not specified",
  "not available",
  "—",
]);

/** 比較不能を示す記述のキーワード（値に含まれていたら比較不能） */
const NON_COMPARABLE_PHRASES = [
  /refer\s+to\s+url/i,
  /see\s+table/i,
  /see\s+graph/i,
  /refer\s+to\s+https/i,
  /see\s+cap\s+chart/i,
  /see\s+packaging\s+codes/i,
  /see\s+.*\s+table/i,
  /individual\s+part\s+number\s+specification/i,
  /数値比較不能/i,
  /比較不能/i,
  /直接比較不可/i,
  /表参照/i,
  /別表参照/i,
  /グラフ参照/i,
];

/**
 * 単一の値が「比較可能な値」かどうかを判定する。
 * 欠損・欠損表現・参照指示のいずれかなら false。
 */
export function isComparableValue(
  value: string | null | undefined
): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  const trimmed = String(value).trim();
  if (trimmed === "") {
    return false;
  }
  const normalized = trimmed.toLowerCase();
  if (MISSING_LITERALS.has(normalized)) {
    return false;
  }
  if (NON_COMPARABLE_PHRASES.some((re) => re.test(trimmed))) {
    return false;
  }
  return true;
}

/**
 * パラメータが「比較成立」かどうかを判定する。
 * - 両方の値が比較可能な値であること
 * - 「- vs -」のように両方欠損の場合は比較不能（上で false になる）
 */
export function isComparableParameter(p: ParameterEvaluation): boolean {
  return isComparableValue(p.targetValue) && isComparableValue(p.candidateValue);
}

/**
 * 比較成立したパラメータのみを返す。
 */
export function getComparableParameters(
  parameters: ParameterEvaluation[]
): ParameterEvaluation[] {
  return parameters.filter(isComparableParameter);
}

/**
 * 類似度スコアを算出する。
 * 比較成立した項目のみの平均。比較成立が 0 件の場合は null。
 */
export function computeAverageScore(
  parameters: ParameterEvaluation[]
): number | null {
  const comparable = getComparableParameters(parameters);
  if (comparable.length === 0) {
    return null;
  }
  const sum = comparable.reduce((acc, p) => acc + p.score, 0);
  return Math.round(sum / comparable.length);
}

/**
 * 信頼度を算出する（別軸。スコアは補正しない）。
 * - totalParams: 全パラメータ数
 * - comparableParams: 比較成立したパラメータ数
 * - confidenceRatioPercent: comparableParams / totalParams * 100
 */
export function computeConfidence(parameters: ParameterEvaluation[]): {
  totalParams: number;
  comparableParams: number;
  confidenceRatioPercent: number;
} {
  const totalParams = parameters.length;
  const comparableParams = getComparableParameters(parameters).length;
  const confidenceRatioPercent =
    totalParams > 0 ? (comparableParams / totalParams) * 100 : 0;
  return {
    totalParams,
    comparableParams,
    confidenceRatioPercent,
  };
}

/**
 * 信頼度を算出する（分母を Target のパラメータ総数で固定）。
 * - targetTotalCount: 分母（Target の比較対象パラメータ総数）。全 Candidate で同一。
 * - matchedCount: 分子（実際に比較が成立したパラメータ数）。Target/Candidate 両方に有効値があるもののみ。
 * - confidenceRatioPercent: matchedCount / targetTotalCount * 100
 */
export function computeConfidenceWithFixedDenominator(
  targetTotalCount: number,
  parameters: ParameterEvaluation[]
): {
  totalParams: number;
  comparableParams: number;
  confidenceRatioPercent: number;
} {
  const comparableParams = getComparableParameters(parameters).length;
  const confidenceRatioPercent =
    targetTotalCount > 0 ? (comparableParams / targetTotalCount) * 100 : 0;
  return {
    totalParams: targetTotalCount,
    comparableParams,
    confidenceRatioPercent,
  };
}

/**
 * 複数の ParameterEvaluation 配列から、重複を除いた parameterId の集合のサイズを返す。
 * Target の比較対象パラメータ総数（分母）の算出に使用する。
 */
export function getTargetTotalParamCount(
  parametersList: ParameterEvaluation[][]
): number {
  const ids = new Set<string>();
  for (const parameters of parametersList) {
    for (const p of parameters) {
      ids.add(p.parameterId);
    }
  }
  return ids.size;
}

/**
 * 各パラメータに is_comparable を付与した配列を返す（既存JSON互換用）。
 * スキーマに is_comparable が無い場合はこの関数で付与して利用する。
 */
export function withComparableFlags(
  parameters: ParameterEvaluation[]
): (ParameterEvaluation & { is_comparable: boolean })[] {
  return parameters.map((p) => ({
    ...p,
    is_comparable: isComparableParameter(p),
  }));
}
