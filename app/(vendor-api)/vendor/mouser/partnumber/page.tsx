"use client";

import { useCallback } from "react";
import useSWRMutation from "swr/mutation";
import { ApiForm } from "@/app/_components/vendor-api/api-form";
import { ResultViewer } from "@/app/_components/vendor-api/json-viewer";
import { MouserCustomView } from "@/app/_components/vendor-api/mouser-custom-view";
import { ApiPageLayout } from "@/app/_components/vendor-api/api-page-layout";
import { searchByPartNumber } from "@/app/_lib/vendor/mouser/api";
import type { PartNumberSearchInput } from "@/app/_lib/vendor/mouser/types";

export default function MouserPartNumberPage() {
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

  const handlePartNumberSubmit = useCallback(
    async (data: Record<string, string | number>) => {
      resetPartNumber();
      await executePartNumberSearch(data as unknown as PartNumberSearchInput);
    },
    [executePartNumberSearch, resetPartNumber]
  );

  const form = (
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
  );

  const result =
    partNumberResult != null ? (
      <ResultViewer
        data={partNumberResult}
        customView={<MouserCustomView data={partNumberResult} />}
        className="h-full"
      />
    ) : null;

  return (
    <ApiPageLayout
      form={form}
      result={result}
      isLoading={partNumberLoading}
      error={partNumberError}
    />
  );
}
