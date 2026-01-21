"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import useSWRMutation from "swr/mutation";
import { searchByKeyword } from "@/app/_lib/vendor/digikey/api";
import type { KeywordSearchInput } from "@/app/_lib/vendor/digikey/types";
import type { DigiKeyProduct } from "@/app/_lib/vendor/digikey/types";

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
          <div className="grid gap-2 max-h-[400px] overflow-y-auto">
            {products.map((product, index) => {
              const isSelected =
                selectedPart?.ManufacturerProductNumber ===
                product.ManufacturerProductNumber;
              return (
                <Card
                  key={index}
                  className={`
                    cursor-pointer transition-colors
                    ${isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"}
                  `}
                  onClick={() => handlePartClick(product)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* 画像 */}
                      {product.PhotoUrl && (
                        <img
                          src={product.PhotoUrl}
                          alt={product.ManufacturerProductNumber}
                          className="w-16 h-16 object-contain border rounded"
                        />
                      )}
                      {/* 情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {product.ManufacturerProductNumber}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {product.Manufacturer?.Name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.Description?.ProductDescription}
                        </div>
                        {product.QuantityAvailable != null && product.QuantityAvailable > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            在庫: {product.QuantityAvailable.toLocaleString()}個
                          </div>
                        )}
                      </div>
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
