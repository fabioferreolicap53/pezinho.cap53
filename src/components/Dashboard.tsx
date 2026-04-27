import { useState, useEffect, useMemo } from "react";
import { Plus, Calendar, TrendingUp, History, Calculator, BarChart3, PieChart as PieIcon, Activity, Loader2, Building2, ChevronDown } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";
import { cn } from "../lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, LabelList } from 'recharts';
import { pb, ensureAuth } from "../lib/pocketbase";

const COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];

const UNITS = [
  "TODAS AS UNIDADES",
  "CF ALICE REGO",
  "CF DEOLINDO COUTO",
  "CF EDSON A. SAAD",
  "CF ERNANI DE P. FERREIRA BRAGA",
  "CF HELANDE DE MELO",
  "CF ILZO MOTTA DE MELO",
  "CF JAMIL HADDAD",
  "CF JOÃO BATISTA CHAGAS",
  "CF JOSÉ ANTÔNIO CIRAUDO",
  "CF LENICE MARIA M. COELHO",
  "CF LOURENÇO DE MELLO",
  "CF SAMUEL PENHA VALLE",
  "CF SÉRGIO AROUCA",
  "CF VALÉRIA GOMES ESTEVES",
  "CF WALDEMAR BERARDINELLI",
  "CMS EMYDIO CABRAL",
  "CMS ADELINO SIMÕES",
  "CMS ALOYSIO AMÂNCIO DA SILVA",
  "CMS CATTAPRETA",
  "CMS CESÁRIO DE MELO",
  "CMS DÉCIO AMARAL FILHO",
  "CMS Dr. CYRO DE MELO",
  "CMS ENFª FLORIPES G. PEREIRA",
  "CMS MARIA APARECIDA ALMEIDA",
  "CMS PROF. SÁVIO ANTUNES",
  "HOSPITAL MUNICIPAL PEDRO II",
  "POLICLÍNICA LINCOLN DE F. FILHO",
];

const MONTHS = [
  "Todos os meses",
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const YEARS = ["2026", "2025", "2024"];

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [shippingData, setShippingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedUnit, setSelectedUnit] = useState("TODAS AS UNIDADES");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("Todos os meses");

  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      try {
        const authenticated = await ensureAuth();
        if (!authenticated) {
          if (!isCancelled) setIsLoading(false);
          return;
        }

        const [historyRecords, shippingRecords] = await Promise.all([
          pb.collection('testedopezinho_history').getFullList({ sort: '-created', requestKey: null }),
          pb.collection('testedopezinho_shipping').getFullList({ sort: '-created', requestKey: null })
        ]);

        if (!isCancelled) {
          setHistoryData(historyRecords);
          setShippingData(shippingRecords);
        }
      } catch (error: any) {
        if (!error.isAbort && !isCancelled) {
          console.error("Erro ao buscar dados:", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Filtered Data
  const filteredHistory = useMemo(() => {
    return historyData.filter(item => {
      const yearMatch = item.year === selectedYear;
      const monthMatch = selectedMonth === "Todos os meses" || item.month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [historyData, selectedYear, selectedMonth]);

  const filteredShipping = useMemo(() => {
    return shippingData.filter(item => {
      const yearMatch = item.year === selectedYear;
      const monthMatch = selectedMonth === "Todos os meses" || item.month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [shippingData, selectedYear, selectedMonth]);

  // Data for Exams by Unit (Top 5)
  const examsByUnitData = useMemo(() => {
    if (selectedUnit !== "TODAS AS UNIDADES") {
      // If a unit is selected, show only that unit's history over time or its total
      const unitData = filteredHistory.reduce((acc, curr) => {
        const unit = curr.units?.find((u: any) => u.name === selectedUnit);
        return acc + (unit ? Number(unit.count) : 0);
      }, 0);
      return [{ 
        name: selectedUnit.replace('CLÍNICA DA FAMÍLIA ', 'CF ').replace('CENTRO MUNICIPAL DE SAÚDE ', 'CMS '), 
        testes: unitData 
      }];
    }

    // Default: Top 5 units in the filtered period
    const unitTotals: Record<string, number> = {};
    filteredHistory.forEach(curr => {
      curr.units?.forEach((u: any) => {
        unitTotals[u.name] = (unitTotals[u.name] || 0) + Number(u.count);
      });
    });

    return Object.entries(unitTotals)
      .map(([name, testes]) => ({ 
        name: name.replace('CLÍNICA DA FAMÍLIA ', 'CF ').replace('CENTRO MUNICIPAL DE SAÚDE ', 'CMS '), 
        testes 
      }))
      .sort((a, b) => b.testes - a.testes)
      .slice(0, 5);
  }, [filteredHistory, selectedUnit]);

  // Data for Exams Trend (Last entries)
  const examsTrendData = useMemo(() => {
    const trend = [...filteredHistory].reverse().map(h => {
      let total = h.totalCount;
      if (selectedUnit !== "TODAS AS UNIDADES") {
        const unit = h.units?.find((u: any) => u.name === selectedUnit);
        total = unit ? Number(unit.count) : 0;
      }
      return {
        date: h.date.split('/')[0] + '/' + h.date.split('/')[1],
        total
      };
    });
    return trend;
  }, [filteredHistory, selectedUnit]);

  // Data for Supplies Distribution
  const suppliesDistData = useMemo(() => {
    return filteredShipping.reduce((acc, curr) => {
      curr.shippings?.forEach((s: any) => {
        if (selectedUnit !== "TODAS AS UNIDADES" && s.unit !== selectedUnit) return;
        
        Object.entries(s.items || {}).forEach(([item, count]) => {
          const existing = acc.find((a: any) => a.name === item);
          if (existing) existing.value += Number(count);
          else acc.push({ name: item, value: Number(count) });
        });
      });
      return acc;
    }, [] as { name: string, value: number }[]);
  }, [filteredShipping, selectedUnit]);

  // Statistics
  const totalExams = useMemo(() => {
    return filteredHistory.reduce((acc, curr) => {
      if (selectedUnit !== "TODAS AS UNIDADES") {
        const unit = curr.units?.find((u: any) => u.name === selectedUnit);
        return acc + (unit ? Number(unit.count) : 0);
      }
      return acc + (Number(curr.totalCount) || 0);
    }, 0);
  }, [filteredHistory, selectedUnit]);

  const totalSupplies = useMemo(() => {
    return filteredShipping.reduce((acc: number, curr: any) => {
      let count = 0;
      curr.shippings?.forEach((s: any) => {
        if (selectedUnit !== "TODAS AS UNIDADES" && s.unit !== selectedUnit) return;
        const items = s.items || {};
        let sumItems = 0;
        Object.values(items).forEach((val: any) => {
          sumItems += (Number(val) || 0);
        });
        count += sumItems;
      });
      return acc + count;
    }, 0);
  }, [filteredShipping, selectedUnit]);

  const unitsAtendidas = useMemo(() => {
    if (selectedUnit !== "TODAS AS UNIDADES") return 1;
    const units = new Set();
    filteredHistory.forEach(h => h.units?.forEach((u: any) => units.add(u.name)));
    return units.size || 27;
  }, [filteredHistory, selectedUnit]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-bright min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-xl bg-surface-bright relative z-10 w-full min-h-screen pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-h1 font-black text-on-surface">Visão Geral</h1>
          <p className="text-sm md:text-body-md text-on-surface-variant mt-1">
            Acompanhamento consolidado de testes do pezinho e insumos.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">UNIDADE</h4>
          </div>
          <div className="relative group">
            <select 
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant/50 rounded-xl text-sm font-bold text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit} className="bg-surface-container-lowest text-on-surface">{unit}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">ANO</h4>
          </div>
          <div className="relative group">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant/50 rounded-xl text-sm font-bold text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
            >
              {YEARS.map(year => (
                <option key={year} value={year} className="bg-surface-container-lowest text-on-surface">{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">MÊS</h4>
          </div>
          <div className="relative group">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant/50 rounded-xl text-sm font-bold text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
            >
              {MONTHS.map(month => (
                <option key={month} value={month} className="bg-surface-container-lowest text-on-surface">{month}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-lg mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start mb-md">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Total Exames ({selectedMonth === "Todos os meses" ? selectedYear : selectedMonth})
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-[18px] h-[18px] text-primary" />
            </div>
          </div>
          <div>
            <div className="font-h1 text-[40px] leading-tight text-on-surface font-bold font-code-numeral">
              {totalExams}
            </div>
            <div className="flex items-center gap-1 text-green-600 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">Total no período</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start mb-md">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Insumos Enviados
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="w-[18px] h-[18px] text-primary" />
            </div>
          </div>
          <div>
            <div className="font-h1 text-[40px] leading-tight text-on-surface font-bold font-code-numeral">
              {totalSupplies}
            </div>
            <div className="text-sm text-on-surface-variant mt-1 font-medium">Consolidado do período</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start mb-md">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Unidades Atendidas
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-[18px] h-[18px] text-primary" />
            </div>
          </div>
          <div>
            <div className="font-h1 text-[40px] leading-tight text-on-surface font-bold font-code-numeral">{unitsAtendidas}</div>
            <div className="text-sm text-on-surface-variant mt-1 font-medium">
              {selectedUnit === "TODAS AS UNIDADES" ? "Rede CAP 5.3" : "Unidade selecionada"}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-xl">
        {/* Exams Trend Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 md:p-xl shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg md:text-h3 font-bold text-on-surface">Tendência de Exames</h3>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examsTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#001b3d', fontWeight: 'bold' }}
                  labelStyle={{ color: '#001b3d', fontWeight: 'black', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 8 }}>
                  <LabelList dataKey="total" position="top" fill="#1e40af" fontSize={11} fontWeight="900" offset={10} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exams by Unit Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 md:p-xl shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg md:text-h3 font-bold text-on-surface">Top 5 Unidades (Exames)</h3>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examsByUnitData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 9}} width={80} />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#001b3d', fontWeight: 'bold' }}
                  labelStyle={{ color: '#001b3d', fontWeight: 'black', marginBottom: '4px' }}
                />
                <Bar dataKey="testes" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  <LabelList dataKey="testes" position="right" fill="#1e40af" fontSize={11} fontWeight="900" offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplies Distribution Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 md:p-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg md:text-h3 font-bold text-on-surface">Distribuição de Insumos</h3>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            <div className="h-[280px] w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={suppliesDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {suppliesDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: '#001b3d', fontWeight: '900', fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col gap-3 min-w-[240px]">
              {suppliesDistData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-4 bg-surface-bright hover:bg-surface-container-high px-5 py-3 rounded-2xl border border-outline-variant/30 transition-all group shadow-sm">
                  <div className="w-4 h-4 rounded-full shadow-lg shadow-black/5 group-hover:scale-110 transition-transform" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[12px] font-black text-on-surface/90 uppercase tracking-widest flex-1">{entry.name}</span>
                  <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 min-w-[40px] text-center">
                    <span className="text-[12px] font-black text-primary">{entry.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed / Placeholder */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-sm">
          <div className="flex items-center gap-3 mb-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface">Atividade Recente</h3>
          </div>
          <div className="space-y-4">
            {[
              { type: 'Exame', unit: 'CMS CATTAPRETA', desc: '30 novos registros', time: 'Há 2 horas' },
              { type: 'Insumo', unit: 'CF ALICE REGO', desc: 'Envio de 90 itens', time: 'Há 5 horas' },
              { type: 'Exame', unit: 'HOSPITAL PEDRO II', desc: '45 novos registros', time: 'Ontem' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-bright transition-colors border border-transparent hover:border-outline-variant/20">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-[10px]",
                  item.type === 'Exame' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                )}>
                  {item.type[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">{item.unit}</p>
                  <p className="text-[12px] text-on-surface-variant">{item.desc}</p>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
