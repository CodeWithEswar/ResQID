import { AppShell } from "@/components/layout/app-shell";
import { CaseIntake } from "@/components/workspace/cases";
export default function NewCasePage() {
  return (
    <AppShell activeTab="cases">
      <CaseIntake />
    </AppShell>
  );
}
