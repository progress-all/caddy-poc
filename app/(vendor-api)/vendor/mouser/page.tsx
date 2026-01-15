"use client";

import { useCallback } from "react";
import useSWRMutation from "swr/mutation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiForm } from "@/app/_components/vendor-api/api-form";
import { ResultViewer } from "@/app/_components/vendor-api/json-viewer";
import { MouserCustomView } from "@/app/_components/vendor-api/mouser-custom-view";
import { Card, CardContent } from "@/components/ui/card";
import {
  searchByKeyword,
  searchByPartNumber,
} from "@/app/_lib/vendor/mouser/api";
import type {
  KeywordSearchInput,
  PartNumberSearchInput,
} from "@/app/_lib/vendor/mouser/types";

export default function MouserPage() {
  const {
    data: keywordResult,
    error: keywordError,
    isMutating: keywordLoading,
    trigger: executeKeywordSearch,
    reset: resetKeyword,
  } = useSWRMutation(
    ["mouser", "keyword"],
    (_key, { arg }: { arg: KeywordSearchInput }) => searchByKeyword(arg)
  );

  const {
    data: partNumberResult,
    error: partNumberError,
    isMutating: partNumberLoading,
    trigger: executePartNumberSearch,
    reset: resetPartNumber,
  } = useSWRMutation(
    ["mouser", "partnumber"],
    (_key, { arg }: { arg: PartNumberSearchInput }) => searchByPartNumber(arg)
  );

  const handleKeywordSubmit = useCallback(
    async (data: Record<string, string | number>) => {
      resetKeyword();
      await executeKeywordSearch(data as unknown as KeywordSearchInput);
    },
    [executeKeywordSearch, resetKeyword]
  );

  const handlePartNumberSubmit = useCallback(
    async (data: Record<string, string | number>) => {
      resetPartNumber();
      await executePartNumberSearch(data as unknown as PartNumberSearchInput);
    },
    [executePartNumberSearch, resetPartNumber]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mouser API</h1>
        <p className="mt-2 text-muted-foreground">
          Mouser SearchApiのエンドポイントを実行して結果を確認できます
        </p>
      </div>

      <Tabs defaultValue="keyword" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keyword">Keyword Search</TabsTrigger>
          <TabsTrigger value="partnumber">Part Number Search</TabsTrigger>
        </TabsList>

        <TabsContent value="keyword" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <ApiForm
                endpoint="Search by Keyword"
                fields={[
                  {
                    name: "keyword",
                    label: "Keyword",
                    placeholder: "例: LM358",
                    required: true,
                    defaultValue: "LM358",
                  },
                  {
                    name: "records",
                    label: "Records (optional)",
                    type: "number",
                    placeholder: "10",
                    defaultValue: 10,
                  },
                  {
                    name: "startingRecord",
                    label: "Starting Record (optional)",
                    type: "number",
                    placeholder: "0",
                    defaultValue: 0,
                  },
                ]}
                onSubmit={handleKeywordSubmit}
                isLoading={keywordLoading}
              />

              {keywordError ? (
                <div className="text-sm text-destructive pt-2">
                  <strong>Error:</strong> {keywordError.message}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {keywordResult != null ? (
            <div className="h-[calc(100vh-280px)] min-h-[500px]">
              <ResultViewer
                data={keywordResult}
                title="Keyword Search Result"
                customView={<MouserCustomView data={keywordResult} />}
                className="h-full"
              />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="partnumber" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <ApiForm
                endpoint="Search by Part Number"
                fields={[
                  {
                    name: "partNumber",
                    label: "Part Number",
                    placeholder: "例: 595-LM358BAIPWR",
                    required: true,
                    defaultValue: "595-LM358BAIPWR",
                  },
                  {
                    name: "partSearchOptions",
                    label: "Part Search Options (optional)",
                    placeholder: "",
                  },
                ]}
                onSubmit={handlePartNumberSubmit}
                isLoading={partNumberLoading}
              />

              {partNumberError ? (
                <div className="text-sm text-destructive pt-2">
                  <strong>Error:</strong> {partNumberError.message}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {partNumberResult != null ? (
            <div className="h-[calc(100vh-280px)] min-h-[500px]">
              <ResultViewer
                data={partNumberResult}
                title="Part Number Search Result"
                customView={<MouserCustomView data={partNumberResult} />}
                className="h-full"
              />
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
