import { HeaderNav } from "@/app/_components/vendor-api/header-nav";

export default function RiskAssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      <HeaderNav />
      <main className="flex-1 min-h-0 overflow-hidden px-5 pt-2 pb-5 flex flex-col">{children}</main>
    </div>
  );
}
