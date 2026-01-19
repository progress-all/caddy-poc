"use client";

import { useCallback } from "react";
import useSWRMutation from "swr/mutation";
import { ApiForm } from "@/app/_components/vendor-api/api-form";
import { ResultViewer } from "@/app/_components/vendor-api/json-viewer";
import { MouserCustomView } from "@/app/_components/vendor-api/mouser-custom-view";
import { ApiPageLayout } from "@/app/_components/vendor-api/api-page-layout";
import { searchByKeyword } from "@/app/_lib/vendor/mouser/api";
import type { KeywordSearchInput } from "@/app/_lib/vendor/mouser/types";

export default function MouserKeywordPage() {
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

  const handleKeywordSubmit = useCallback(
    async (data: Record<string, string | number>) => {
      resetKeyword();
      await executeKeywordSearch(data as unknown as KeywordSearchInput);
    },
    [executeKeywordSearch, resetKeyword]
  );

  const form = (
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
  );

  const result =
    keywordResult != null ? (
      <ResultViewer
        data={keywordResult}
        customView={<MouserCustomView data={keywordResult} />}
        className="h-full"
      />
    ) : null;

  return (
    <ApiPageLayout
      form={form}
      result={result}
      isLoading={keywordLoading}
      error={keywordError}
    />
  );
}
