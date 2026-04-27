import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { pb, ensureAuth } from "../lib/pocketbase";

const MONTHS = [
  { name: "Janeiro", value: "01" },
  { name: "Fevereiro", value: "02" },
  { name: "Março", value: "03" },
  { name: "Abril", value: "04" },
  { name: "Maio", value: "05" },
  { name: "Junho", value: "06" },
  { name: "Julho", value: "07" },
  { name: "Agosto", value: "08" },
  { name: "Setembro", value: "09" },
  { name: "Outubro", value: "10" },
  { name: "Novembro", value: "11" },
  { name: "Dezembro", value: "12" },
];

const ITEMS = ["Filtro Vermelho", "Filtro Azul", "Lanceta", "Envelope"];

export function PrintShipping() {
  const location = useLocation();
  const passedShipping = location.state?.shipping;

  const [selectedYear, setSelectedYear] = useState(passedShipping?.year || "2026");
  const [selectedMonth, setSelectedMonth] = useState(passedShipping?.month || "Abril");
  const [selectedDay, setSelectedDay] = useState(passedShipping?.day || "");
  const [dbRecord, setDbRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecord() {
      if (passedShipping) return;
      if (!selectedYear || !selectedMonth || !selectedDay) {
        setDbRecord(null);
        return;
      }

      setIsLoading(true);
      try {
        const authenticated = await ensureAuth();
        if (!authenticated) throw new Error("Auth failed");

        const records = await pb.collection('testedopezinho_shipping').getList(1, 1, {
          filter: `year = "${selectedYear}" && month = "${selectedMonth}" && day = "${selectedDay}"`,
        });

        if (records.items.length > 0) {
          setDbRecord(records.items[0]);
        } else {
          setDbRecord(null);
        }
      } catch (error) {
        console.error("Error fetching record:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecord();
  }, [passedShipping, selectedYear, selectedMonth, selectedDay]);

  const shippingData = passedShipping || dbRecord;

  const handlePrint = () => {
    const originalTitle = document.title;
    const monthVal = MONTHS.find(m => m.name === selectedMonth)?.value || "01";
    document.title = `Envio_Insumos_${selectedDay}_${monthVal}_${selectedYear}`;
    window.print();
    document.title = originalTitle;
  };

  if (!shippingData && !isLoading && !passedShipping) {
    return (
      <main className="flex-1 overflow-y-auto p-xl bg-slate-50 min-h-screen">
        <div className="max-w-[850px] mx-auto mb-lg bg-white p-xl rounded-3xl border border-outline-variant shadow-xl flex justify-between items-center">
          <Link to="/envio-unidades" className="flex items-center gap-2 text-[#001b3d] hover:text-[#004a99] transition-colors font-bold group">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Voltar ao Envio
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Ano</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded-lg px-2 py-1 text-sm">
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Mês</label>
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded-lg px-2 py-1 text-sm">
                {MONTHS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Dia</label>
              <input type="number" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="border rounded-lg px-2 py-1 text-sm w-16" placeholder="24" />
            </div>
          </div>
        </div>
        <div className="max-w-[850px] mx-auto bg-white p-20 rounded-3xl border border-slate-200 text-center">
          <p className="text-[#001b3d] font-bold">Nenhum registro encontrado para este período.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-xl bg-slate-50 min-h-screen">
      {/* Configuration Bar - Hidden on Print */}
      <div className="max-w-[850px] mx-auto mb-lg bg-white p-xl rounded-3xl border border-outline-variant shadow-xl print:hidden flex justify-between items-center">
        <Link to="/envio-unidades" className="flex items-center gap-2 text-[#001b3d] hover:text-[#004a99] transition-colors font-bold group">
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar ao Envio
        </Link>

        {!passedShipping && (
          <div className="flex items-center gap-6 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Ano</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-outline-variant/50 rounded-lg px-4 py-2 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white w-32 text-on-surface transition-all"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Mês</label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-outline-variant/50 rounded-lg px-4 py-2 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white w-40 text-on-surface transition-all"
                >
                  {MONTHS.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Dia</label>
                <input 
                  type="number"
                  min="1"
                  max="31"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-outline-variant/50 rounded-lg px-4 py-2 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white w-24 text-on-surface transition-all"
                  placeholder="Ex: 24"
                />
              </div>
              {isLoading && (
                <div className="flex items-end pb-2">
                  <Loader2 className="w-5 h-5 text-[#001b3d] animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-8 py-2.5 bg-[#001b3d] text-white rounded-xl hover:bg-[#002b5c] transition-all shadow-lg shadow-[#001b3d]/20 font-bold"
        >
          <Printer className="w-4 h-4" />
          Imprimir Envio
        </button>
      </div>

      {/* Print Document Area */}
      <div className="max-w-[850px] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-full overflow-hidden border border-slate-200 print:border-none">
        {/* Header Banner - Optimized for ink saving */}
        <div className="bg-[#001b3d] print:bg-white p-4 flex justify-between items-center text-white print:text-[#001b3d] relative overflow-hidden print:border-b-2 print:border-[#001b3d]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 print:hidden"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white print:bg-white p-1 rounded-lg shadow-xl print:shadow-none flex items-center justify-center border print:border-[#001b3d]">
              <div className="w-full h-full bg-[#001b3d] print:bg-white rounded-lg flex items-center justify-center font-black text-white print:text-[#001b3d] text-xl italic">
                RIO
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight tracking-tight uppercase">Saúde Pública Carioca</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-[1px] w-6 bg-white/30 print:bg-[#001b3d]/30"></span>
                <p className="text-[8px] opacity-80 uppercase tracking-[0.2em] font-bold">Prefeitura do Rio de Janeiro</p>
              </div>
            </div>
          </div>
          <div className="text-right relative z-10 hidden sm:block">
            <p className="text-[10px] font-bold italic opacity-70">CAP 5.3 / DAPS</p>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 space-y-4 font-serif text-[#001b3d]">
          <div className="space-y-2 text-center">
            <div className="inline-block px-3 py-0.5 border-2 border-[#001b3d] text-[9px] font-black uppercase tracking-widest mb-1">
              Consolidado de Insumos
            </div>
            <div className="space-y-0.5 text-[14px]">
              <p className="font-bold text-[10px] opacity-80 uppercase">De: S/SUBPAV/CAP 5.3 / DAPS</p>
              <p className="font-black text-lg uppercase underline underline-offset-4 decoration-2">
                DATA: {shippingData.day} / {shippingData.month} / {shippingData.year}
              </p>
              <p className="font-bold text-xs mt-1">Assunto: Encaminhamento de Insumos às Unidades</p>
            </div>
          </div>

          <div className="space-y-2 text-[12px] leading-tight max-w-2xl mx-auto text-center italic">
            <p>
              Informamos que estamos encaminhando os insumos para o <span className="font-black not-italic">Programa de Triagem Neonatal</span>, 
              referentes às Unidades de Saúde da <span className="font-black not-italic">CAP 5.3</span> listadas abaixo:
            </p>
          </div>

          {/* Table */}
          <div className="border-[1.5px] border-[#001b3d] shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#001b3d] print:bg-white text-white print:text-[#001b3d]">
                  <th className="py-1 px-4 text-[10px] font-black uppercase border-r border-white/20 print:border-[#001b3d]/20 tracking-[0.2em] text-left">Unidade de Saúde</th>
                  {ITEMS.map(item => (
                    <th key={item} className="py-1 px-2 text-[10px] font-black uppercase border-r border-white/20 print:border-[#001b3d]/20 tracking-tighter text-center">
                      {item.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {shippingData.shippings.map((ship, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#001b3d]/[0.02]"}>
                    <td className="py-0.5 px-4 font-bold text-left border-r border-[#001b3d]/10 border-b border-b-[#001b3d]/5 uppercase tracking-tight leading-none h-5">
                      {ship.unit}
                    </td>
                    {ITEMS.map(item => (
                      <td key={item} className="py-0.5 px-2 font-black text-center border-r border-[#001b3d]/10 border-b border-b-[#001b3d]/5 text-[12px] h-5">
                        {ship.items[item] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#001b3d] print:bg-white text-white print:text-[#001b3d] border-t-2 border-[#001b3d]">
                  <td className="py-1.5 px-4 text-[11px] font-black uppercase border-r border-white/20 print:border-[#001b3d]/20 text-right tracking-widest">
                    Totais
                  </td>
                  {ITEMS.map(item => (
                    <td key={item} className="py-1.5 px-2 text-sm font-black text-center bg-[#001b3d] print:bg-white border-r border-white/10 print:border-[#001b3d]/10">
                      {shippingData.shippings.reduce((acc, curr) => acc + (curr.items[item] || 0), 0)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* CSS for Print Optimization */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0.5cm; size: A4; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          main { padding: 0 !important; background: white !important; }
          .max-w-[850px] { max-width: 100% !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
          .shadow-2xl { box-shadow: none !important; }
          .p-xl { padding: 0 !important; }
          .bg-slate-50 { background: white !important; }
        }
      `}} />
    </main>
  );
}
