"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, Table2, ListTree, Braces } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/_lib/utils";

const VisualViewerWrapper = dynamic(
  () => import("./visual-viewer").then((mod) => mod.VisualViewerWrapper),
  { loading: () => <div className="p-4 text-muted-foreground">Loading...</div> }
);

interface ResultViewerProps {
  data: unknown;
  title?: string;
  customView?: React.ReactNode;
  className?: string;
}

export function ResultViewer({
  data,
  title = "Response",
  customView,
  className,
}: ResultViewerProps) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  // デフォルトタブの決定: customViewがあればcustom、なければvisualJson
  const defaultTab = customView ? "custom" : "visualJson";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardContent className="p-4 pt-4 flex flex-col flex-1 min-h-0">
        <div className="space-y-4 flex flex-col flex-1 min-h-0">
          {title ? (
            <h3 className="text-sm font-semibold text-foreground flex-shrink-0">{title}</h3>
          ) : null}
          <div className="flex flex-col flex-1 min-h-0">
            <Tabs defaultValue={defaultTab} className="w-full flex flex-col flex-1 min-h-0">
              <TabsList className="flex-shrink-0">
                {customView ? (
                  <TabsTrigger value="custom" aria-label="カスタムビュー">
                    <Table2 className="h-4 w-4" />
                  </TabsTrigger>
                ) : null}
                <TabsTrigger value="visualJson" aria-label="ビジュアルJSON">
                  <ListTree className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="json" aria-label="JSON">
                  <Braces className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
              {customView ? (
                <TabsContent value="custom" className="mt-4 flex-1 min-h-0">
                  <div className="h-full flex flex-col">
                    {customView}
                  </div>
                </TabsContent>
              ) : null}
              <TabsContent value="visualJson" className="mt-4 flex-1 min-h-0">
                <div className="h-full overflow-auto border rounded-md p-4">
                  <VisualViewerWrapper data={data} />
                </div>
              </TabsContent>
              <TabsContent value="json" className="mt-4 flex-1 min-h-0">
                <div className="h-full flex flex-col space-y-2">
                  <div className="flex justify-end flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          コピーしました
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          コピー
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="flex-1 overflow-auto rounded-md bg-muted p-4 text-sm">
                    <code>{jsonString}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 後方互換性のため、JsonViewerもエクスポート
export function JsonViewer({ data, title = "Response" }: { data: unknown; title?: string }) {
  return <ResultViewer data={data} title={title} />;
}
