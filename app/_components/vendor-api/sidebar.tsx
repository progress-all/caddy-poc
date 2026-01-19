"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/app/_lib/utils";

interface ApiEndpoint {
  href: string;
  label: string;
  disabled?: boolean;
}

interface Vendor {
  label: string;
  endpoints: ApiEndpoint[];
}

const vendors: Vendor[] = [
  {
    label: "Mouser",
    endpoints: [
      {
        href: "/vendor/mouser/keyword",
        label: "Keyword Search",
      },
      {
        href: "/vendor/mouser/partnumber",
        label: "Part Number Search",
      },
    ],
  },
  {
    label: "DigiKey",
    endpoints: [
      {
        href: "/vendor/digikey/keyword",
        label: "Keyword Search",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(() => {
    // 現在のパスに基づいて初期展開状態を決定
    const initial = new Set<string>();
    vendors.forEach((vendor) => {
      const isActive = vendor.endpoints.some(
        (endpoint) => pathname === endpoint.href
      );
      if (isActive) {
        initial.add(vendor.label);
      }
    });
    // 何も一致しない場合は最初のベンダーを展開
    if (initial.size === 0 && vendors.length > 0) {
      initial.add(vendors[0].label);
    }
    return initial;
  });

  const toggleVendor = (vendorLabel: string) => {
    setExpandedVendors((prev) => {
      const next = new Set(prev);
      if (next.has(vendorLabel)) {
        next.delete(vendorLabel);
      } else {
        next.add(vendorLabel);
      }
      return next;
    });
  };

  const isVendorExpanded = (vendorLabel: string) => {
    return expandedVendors.has(vendorLabel);
  };

  const isEndpointActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 flex-shrink-0">
        <h2 className="mb-4 text-lg font-semibold">Vendor APIs</h2>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="space-y-1">
          {vendors.map((vendor) => {
            const isExpanded = isVendorExpanded(vendor.label);
            const hasActiveEndpoint = vendor.endpoints.some((endpoint) =>
              isEndpointActive(endpoint.href)
            );

            return (
              <div key={vendor.label} className="space-y-1">
                <button
                  onClick={() => toggleVendor(vendor.label)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left",
                    hasActiveEndpoint
                      ? "bg-primary/10 text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{vendor.label}</span>
                </button>
                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l-2 border-border/30 pl-2">
                    {vendor.endpoints.map((endpoint) => {
                      const isActive = isEndpointActive(endpoint.href);
                      return (
                        <Link
                          key={endpoint.href}
                          href={endpoint.disabled ? "#" : endpoint.href}
                          className={cn(
                            "block rounded-md px-3 py-1.5 text-sm transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            endpoint.disabled &&
                              "cursor-not-allowed opacity-50"
                          )}
                        >
                          {endpoint.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
