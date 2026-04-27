import { Printer, Download, ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useMemo, useRef, useEffect } from "react";
import { pb, ensureAuth } from "../lib/pocketbase";

const UNITS = [
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

export function PrintView() {
  const location = useLocation();
  const passedRecord = location.state?.record;

  const [selectedYear, setSelectedYear] = useState(passedRecord?.year || "2026");
  const [selectedMonth, setSelectedMonth] = useState(passedRecord?.month || "Abril");
  const [selectedDay, setSelectedDay] = useState(passedRecord?.day || "");
  const [dbRecord, setDbRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecord() {
      if (passedRecord) return;
      if (!selectedYear || !selectedMonth || !selectedDay) {
        setDbRecord(null);
        return;
      }

      setIsLoading(true);
      try {
        const authenticated = await ensureAuth();
        if (!authenticated) throw new Error("Auth failed");

        const records = await pb.collection('testedopezinho_history').getList(1, 1, {
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
  }, [passedRecord, selectedYear, selectedMonth, selectedDay]);

  const filteredData = useMemo(() => {
    const record = passedRecord || dbRecord;
    
    if (!record) return {};
    
    return record.units.reduce((acc: any, curr: any) => {
      acc[curr.name] = curr.count;
      return acc;
    }, {} as Record<string, number>);
  }, [passedRecord, dbRecord]);

  const total = Object.values(filteredData).reduce((a: number, b: any) => a + (Number(b) || 0), 0);

  const monthValue = MONTHS.find(m => m.name === selectedMonth)?.value || "01";

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Consolidado_Pezinho_${selectedDay}_${monthValue}_${selectedYear}`;
    window.print();
    document.title = originalTitle;
  };

  const handleSavePDF = () => {
    if (!printRef.current) return;
    
    const element = printRef.current;
    const opt = {
      margin: 1,
      filename: `Consolidado_Pezinho_${selectedDay}_${monthValue}_${selectedYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  return (
    <main className="flex-1 overflow-y-auto p-xl bg-slate-50 min-h-screen">
      {/* Configuration Bar - Hidden on Print */}
      <div className="max-w-[850px] mx-auto mb-lg bg-white p-xl rounded-3xl border border-outline-variant shadow-xl print:hidden flex justify-between items-center">
        <Link to="/historico" className="flex items-center gap-2 text-[#001b3d] hover:text-[#004a99] transition-colors font-bold group">
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar ao Histórico
        </Link>

        {!passedRecord && (
          <div className="flex items-center gap-6 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  ANO <span className="text-red-400 ml-1">*</span>
                </label>
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
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  MÊS <span className="text-red-400 ml-1">*</span>
                </label>
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
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  DIA <span className="text-red-400 ml-1">*</span>
                </label>
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
          Imprimir Agora
        </button>
      </div>

      {/* Print Document Area */}
      <div ref={printRef} className="max-w-[850px] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-full overflow-hidden border border-slate-200 print:border-none">
        {/* Blue Header Banner */}
        <div className="bg-[#001b3d] p-3 flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white p-1 rounded-lg shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-[#001b3d] rounded-md flex items-center justify-center font-black text-white text-lg italic">
                RIO
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight tracking-tight uppercase">Saúde Pública Carioca</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-[1px] w-6 bg-white/30"></span>
                <p className="text-[8px] opacity-80 uppercase tracking-[0.2em] font-bold">Prefeitura do Rio de Janeiro</p>
              </div>
            </div>
          </div>
          <div className="text-right relative z-10 hidden sm:block">
            <p className="text-[9px] font-bold italic opacity-70">CAP 5.3 / DAPS</p>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-4 space-y-3 font-serif text-[#001b3d]">
          <div className="space-y-1 text-center">
            <div className="inline-block px-3 py-0.5 border-2 border-[#001b3d] text-[8px] font-black uppercase tracking-widest mb-1">
              Consolidado de Exames
            </div>
            <div className="space-y-0 text-[13px]">
              <p className="font-bold text-[9px] opacity-80 uppercase">De: S/SUBPAV/CAP 5.3 / DAPS</p>
              <p className="font-black text-base uppercase underline underline-offset-4 decoration-2">
                DATA: {selectedDay} / {monthValue} / {selectedYear}
              </p>
              <p className="font-bold text-[11px] mt-1">Assunto: Encaminhamento de Exames do Teste do Pezinho</p>
            </div>
          </div>

          <div className="space-y-1 text-[11px] leading-tight max-w-2xl mx-auto text-center italic">
            <p>
              Informamos que estamos encaminhando, por intermédio do portador 
              <span className="font-black not-italic ml-1 border-b border-[#001b3d]">Sr. PAULO DO NASCIMENTO FERREIRA</span>,
            </p>
            <p>
              os exames coletados para o <span className="font-black not-italic">Programa de Triagem Neonatal</span>, 
              referentes às Unidades de Saúde da <span className="font-black not-italic">CAP 5.3</span> listadas abaixo:
            </p>
          </div>

          {/* Table */}
          <div className="border-[1.5px] border-[#001b3d] shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#001b3d] text-white">
                  <th className="py-0.5 px-4 text-[9px] font-black uppercase border-r border-white/20 tracking-[0.2em] text-left">Unidade de Saúde</th>
                  <th className="py-0.5 px-4 text-[9px] font-black uppercase w-20 tracking-[0.2em]">Qtd</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {UNITS.map((unit, idx) => (
                  <tr key={unit} className={idx % 2 === 0 ? "bg-white" : "bg-[#001b3d]/[0.01]"}>
                    <td className="py-0 px-4 font-bold text-left border-r border-[#001b3d]/10 border-b border-b-[#001b3d]/5 uppercase tracking-tighter leading-none h-5">
                      {unit}
                    </td>
                    <td className="py-0 px-4 font-black text-center border-b border-b-[#001b3d]/5 text-[12px] h-5">
                      {filteredData[unit] || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#001b3d] text-white">
                  <td className="py-1 px-4 text-[10px] font-black uppercase border-r border-white/20 text-right tracking-widest">
                    Total Consolidado
                  </td>
                  <td className="py-1 px-6 text-sm font-black text-center bg-[#001b3d]">
                    {total}
                  </td>
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


