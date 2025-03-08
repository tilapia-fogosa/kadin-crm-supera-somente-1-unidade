import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFilteredCommercialStats } from '@/hooks/useFilteredCommercialStats';

const MONTHS = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" }
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

interface CommercialStats {
  id: string;
  name: string;
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  ceConversionRate: number;
  scheduledVisits: number;
  agConversionRate: number;
  awaitingVisits: number;
  completedVisits: number;
  atConversionRate: number;
  enrollments: number;
}

export default function CommercialPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const { 
    unitStats, 
    userStats, 
    sourceStats, 
    isLoading,
    selectedUnitId,
    setSelectedUnitId,
    availableUnits
  } = useFilteredCommercialStats(selectedMonth, selectedYear);

  const renderTable = (title: string, data: CommercialStats[] | undefined, isLoading: boolean) => (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center bg-[#FEC6A1] w-[200px] text-xs font-semibold sticky left-0 z-10">{title.split(" ")[2]}</TableHead>
              <TableHead className="text-center w-[100px] whitespace-pre-line text-xs font-semibold">{"Novos\nClientes"}</TableHead>
              <TableHead className="text-center w-[100px] whitespace-pre-line text-xs font-semibold">{"Total de\nContatos"}</TableHead>
              <TableHead className="text-center w-[100px] whitespace-pre-line text-xs font-semibold">{"Contatos\nEfetivos"}</TableHead>
              <TableHead className="text-center w-[80px] bg-[#FEC6A1] text-xs font-semibold">% CE</TableHead>
              <TableHead className="text-center w-[100px] whitespace-pre-line text-xs font-semibold">{"Visitas\nAgendadas"}</TableHead>
              <TableHead className="text-center w-[80px] bg-[#FEC6A1] text-xs font-semibold">% AG</TableHead>
              <TableHead className="text-center w-[100px] whitespace-pre-line text-xs font-semibold">{"Visitas\nAguardadas"}</TableHead>
              <TableHead className="text-center w-[100px] whitespace-pre-line text-xs font-semibold">{"Visitas\nRealizadas"}</TableHead>
              <TableHead className="text-center w-[80px] bg-[#FEC6A1] text-xs font-semibold">% AT</TableHead>
              <TableHead className="text-center w-[100px] whitespace-pre-line text-xs font-semibold">{"Matrí-\nculas"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-xs py-3">Carregando...</TableCell>
              </TableRow>
            ) : (
              data?.map(stat => (
                <TableRow key={stat.id} className="hover:bg-muted/50">
                  <TableCell className="text-center bg-[#FEC6A1] text-xs py-2 sticky left-0 z-10">{stat.name}</TableCell>
                  <TableCell className="text-center text-xs py-2">{stat.newClients}</TableCell>
                  <TableCell className="text-center text-xs py-2">{stat.contactAttempts}</TableCell>
                  <TableCell className="text-center text-xs py-2">{stat.effectiveContacts}</TableCell>
                  <TableCell className="text-center bg-[#FEC6A1] text-xs py-2">{stat.ceConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-xs py-2">{stat.scheduledVisits}</TableCell>
                  <TableCell className="text-center bg-[#FEC6A1] text-xs py-2">{stat.agConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-xs py-2">{stat.awaitingVisits}</TableCell>
                  <TableCell className="text-center text-xs py-2">{stat.completedVisits}</TableCell>
                  <TableCell className="text-center bg-[#FEC6A1] text-xs py-2">{stat.atConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-xs py-2">{stat.enrollments}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Gestão Comercial</h1>
        
        <div className="flex flex-wrap gap-4 justify-start">
          <div className="flex items-center gap-2">
            <span className="font-medium">Mês:</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Ano:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Unidade:</span>
            <Select 
              value={selectedUnitId || ''} 
              onValueChange={setSelectedUnitId}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Todas as unidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as unidades</SelectItem>
                {availableUnits.map(unit => (
                  <SelectItem key={unit.unit_id} value={unit.unit_id}>
                    {unit.units.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {renderTable("Dados por Unidade", unitStats, isLoading)}
        {renderTable("Dados por Usuário", userStats, isLoading)}
        {renderTable("Dados por Origem", sourceStats, isLoading)}
      </div>
    </div>
  );
}
