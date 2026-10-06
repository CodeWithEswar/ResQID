import { AppShell } from "@/components/layout/app-shell";
import { CaseRecord } from "@/components/workspace/cases";
export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell activeTab="cases">
      <CaseRecord id={id} />
    </AppShell>
  );
}
