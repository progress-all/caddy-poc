/**
 * Risk Assessment API クライアント関数
 */

import type { SimilarSearchRequest, SimilarSearchResponse } from "./types";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch");
  }

  return response.json();
}

/**
 * 類似品検索API呼び出し
 * @param input 検索パラメータ（mpn必須、digiKeyProductNumberオプション）
 * @returns 候補リストとソース情報
 */
export async function searchSimilarProducts(
  input: SimilarSearchRequest
): Promise<SimilarSearchResponse> {
  return postJson<SimilarSearchResponse>(
    "/api/risk-assessment/similar-search",
    input
  );
}
