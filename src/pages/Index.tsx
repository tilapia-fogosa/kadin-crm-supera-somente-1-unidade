import { UsersIcon } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import LeadsTable from "@/components/leads/LeadsTable";
import { useLeadsStats } from "@/hooks/useLeadsStats";
import { UnitSelector } from "@/components/UnitSelector";
import { useUnit } from "@/contexts/UnitContext";

const Index = () => {
  const { selectedUnitId, isLoading: isLoadingUnit } = useUnit();
  const { data: stats, isLoading } = useLeadsStats(selectedUnitId);

  if (isLoading || isLoadingUnit) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>;
  }

  if (!selectedUnitId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Selecione uma unidade para ver o dashboard</p>
        <UnitSelector />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 flex flex-col items-start">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <UnitSelector />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <StatsCard
          title="Mês Atual"
          value={stats?.oneMonth.total || 0}
          icon={UsersIcon}
          comparison={stats?.oneMonth.comparison}
          description="Comparado ao mesmo mês do ano anterior"
        />
        <StatsCard
          title="3 Meses"
          value={stats?.threeMonths.total || 0}
          icon={UsersIcon}
          comparison={stats?.threeMonths.comparison}
          description="Comparado aos mesmos 3 meses do ano anterior"
        />
        <StatsCard
          title="6 Meses"
          value={stats?.sixMonths.total || 0}
          icon={UsersIcon}
          comparison={stats?.sixMonths.comparison}
          description="Comparado aos mesmos 6 meses do ano anterior"
        />
        <StatsCard
          title="12 Meses"
          value={stats?.twelveMonths.total || 0}
          icon={UsersIcon}
          comparison={stats?.twelveMonths.comparison}
          description="Comparado aos 12 meses anteriores"
        />
      </div>
      <div className="w-full">
        <LeadsChart />
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Leads Recentes</h2>
        </div>
        <LeadsTable />
      </div>
    </div>
  );
};

export default Index;
