/**
 * 類似度計算のパラメータ設定
 * 
 * 比較対象とするパラメータと、各パラメータに適用するマッチャーを定義します。
 */

export type MatcherType = "exact" | "numeric" | "tolerance" | "range";

/**
 * 比較対象パラメータの定義
 */
export interface ComparisonParameter {
  /** データソース */
  source: "digikey" | "datasheet";
  /** パラメータ識別子（DigiKey: name, Datasheet: id） */
  id: string;
  /** 表示名（モーダル用） */
  displayName: string;
  /** マッチャーの種類 */
  matcher: MatcherType;
  /** 重み（デフォルト: 1） */
  weight?: number;
  /** 数値マッチャーの場合の許容誤差（デフォルト: 0.2 = 20%） */
  tolerance?: number;
}

/**
 * 比較対象パラメータのリスト
 * 
 * このリストに定義されたパラメータがすべて比較対象となります。
 * 両方に値がある場合はスコア計算、片方のみの場合は「比較不可」として記録されます。
 */
export const COMPARISON_PARAMETERS: ComparisonParameter[] = [
  // ===== DigiKey Parameters =====
  {
    source: "digikey",
    id: "Capacitance",
    displayName: "静電容量",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.2, // 20%許容
  },
  {
    source: "digikey",
    id: "Voltage - Rated",
    displayName: "定格電圧",
    matcher: "tolerance",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Package / Case",
    displayName: "パッケージ",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Temperature Coefficient",
    displayName: "温度特性",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Operating Temperature",
    displayName: "動作温度",
    matcher: "range",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Tolerance",
    displayName: "許容差",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Mounting Type",
    displayName: "実装タイプ",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Size / Dimension",
    displayName: "サイズ",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Thickness (Max)",
    displayName: "厚さ",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.2,
  },
  {
    source: "digikey",
    id: "Height - Seated (Max)",
    displayName: "高さ",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.2,
  },
  {
    source: "digikey",
    id: "Applications",
    displayName: "用途",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Features",
    displayName: "特徴",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Ratings",
    displayName: "定格",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "Lead Spacing",
    displayName: "リード間隔",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.2,
  },
  {
    source: "digikey",
    id: "Lead Style",
    displayName: "リード形状",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "digikey",
    id: "ESR (Equivalent Series Resistance)",
    displayName: "ESR",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.3, // 30%許容
  },
  {
    source: "digikey",
    id: "Inductance",
    displayName: "インダクタンス",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.2,
  },
  {
    source: "digikey",
    id: "Resistance",
    displayName: "抵抗値",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.2,
  },
  {
    source: "digikey",
    id: "Current - Rated",
    displayName: "定格電流",
    matcher: "tolerance",
    weight: 1,
  },

  // ===== Datasheet Parameters =====
  {
    source: "datasheet",
    id: "NominalCapacitance",
    displayName: "公称静電容量",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.2,
  },
  {
    source: "datasheet",
    id: "RatedVoltage",
    displayName: "定格電圧",
    matcher: "tolerance",
    weight: 1,
  },
  {
    source: "datasheet",
    id: "CapacitanceTolerance",
    displayName: "静電容量許容差",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "datasheet",
    id: "TemperatureCharacteristics_PublicSTD",
    displayName: "温度特性（規格コード）",
    matcher: "exact",
    weight: 1,
  },
  {
    source: "datasheet",
    id: "TemperatureCharacteristics_CapChange",
    displayName: "温度特性（容量変化率）",
    matcher: "range",
    weight: 1,
  },
  {
    source: "datasheet",
    id: "TemperatureCharacteristics_TempRange",
    displayName: "温度特性（温度範囲）",
    matcher: "range",
    weight: 1,
  },
  {
    source: "datasheet",
    id: "L_Dimensions",
    displayName: "長さ (L寸法)",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.1, // 10%許容（寸法は厳密）
  },
  {
    source: "datasheet",
    id: "W_Dimensions",
    displayName: "幅 (W寸法)",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.1,
  },
  {
    source: "datasheet",
    id: "T_Dimensions",
    displayName: "厚さ (T寸法)",
    matcher: "numeric",
    weight: 1,
    tolerance: 0.1,
  },
];

/**
 * パラメータ設定を取得
 * 
 * @param source データソース
 * @param identifier パラメータ識別子（DigiKey: name, Datasheet: id）
 */
export function getComparisonParameter(
  source: "digikey" | "datasheet",
  identifier: string
): ComparisonParameter | undefined {
  return COMPARISON_PARAMETERS.find((param) => {
    if (param.source !== source) return false;
    return param.id === identifier;
  });
}

/**
 * すべての比較対象パラメータを取得
 */
export function getAllComparisonParameters(): ComparisonParameter[] {
  return COMPARISON_PARAMETERS;
}

/**
 * デフォルト設定（設定が見つからない場合に使用）
 */
export const DEFAULT_CONFIG: ComparisonParameter = {
  source: "digikey",
  id: "",
  displayName: "",
  matcher: "exact",
  weight: 1,
};
