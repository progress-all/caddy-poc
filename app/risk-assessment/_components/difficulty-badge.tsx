"use client";

import { Badge } from "@/components/ui/badge";
import type { DifficultyLevel } from "../_lib/types";
import { cn } from "@/app/_lib/utils";

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  className?: string;
}

const difficultyConfig: Record<
  DifficultyLevel,
  { label: string; className: string; icon: string }
> = {
  Low: {
    label: "Low",
    className: "bg-green-500 text-white border-green-600",
    icon: "🟢",
  },
  Medium: {
    label: "Medium",
    className: "bg-yellow-500 text-white border-yellow-600",
    icon: "🟡",
  },
  High: {
    label: "High",
    className: "bg-red-500 text-white border-red-600",
    icon: "🔴",
  },
};

export function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[level];

  return (
    <Badge className={cn("text-xs", config.className, className)}>
      {config.icon} {config.label}
    </Badge>
  );
}
