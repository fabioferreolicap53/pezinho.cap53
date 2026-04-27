import { X, Save, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { pb } from "../lib/pocketbase";

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

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isViewOnly?: boolean;
  initialData?: any;
  onSave?: () => void;
}

export function RegistrationModal({ isOpen, onClose, isViewOnly = false, initialData, onSave }: RegistrationModalProps) {
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("Abril");
  const [day, setDay] = useState("");
  const [unitCounts, setUnitCounts] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setYear(initialData.year || "2026");
      setMonth(initialData.month || "Abril");
      setDay(initialData.day || "");
      const counts: Record<string, string> = {};
      (initialData.units || []).forEach((u: any) => {
        counts[u.name] = String(u.count || "");
      });
      setUnitCounts(counts);
    } else {
      const now = new Date();
      setYear("2026");
      setMonth("Abril");
      setDay(String(now.getDate()).padStart(2, '0'));
      setUnitCounts({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const totalCount = Object.values(unitCounts).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const units = UNITS.map(name => ({
        name,
        count: Number(unitCounts[name]) || 0
      })).filter(u => u.count > 0);

      const date = `${day}/${month.padStart(2, '0')}/${year}`; // This format might need adjustment based on how month is stored
      // Actually, SHARED_HISTORY uses "24/04/2026". We should probably format it correctly.
      const monthIndex = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].indexOf(month) + 1;
      const formattedDate = `${day}/${String(monthIndex).padStart(2, '0')}/${year}`;

      const data = {
        date: formattedDate,
        day,
        month,
        year,
        totalCount,
        units,
        createdAt: initialData?.createdAt || new Date().toLocaleString('pt-BR'),
        updatedAt: new Date().toLocaleString('pt-BR')
      };

      if (initialData?.id) {
        await pb.collection('testedopezinho_history').update(initialData.id, data);
      } else {
        await pb.collection('testedopezinho_history').create(data);
      }
      onSave?.();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar os dados.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#001b3d]/80 z-50 flex items-center justify-center p-0 md:p-8 backdrop-blur-sm transition-all duration-300">
      <div className="bg-surface-container-lowest rounded-none md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-5xl h-full md:h-auto md:max-h-[85vh] flex flex-col border border-outline-variant/30 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-6 md:px-xl md:py-lg border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
          <div>
            <h3 className="font-h2 text-h2 text-on-surface">
              Registro de Testes do Pezinho
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Insira a quantidade de testes realizados por unidade de saúde.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-full transition-all flex items-center justify-center group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-8 lg:p-xl overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest">
          {/* Date Selection */}
          <div className="mb-xl bg-surface-bright/50 p-lg border border-outline-variant/30 rounded-xl shadow-sm">
            <h4 className="font-label-caps text-label-caps text-on-surface mb-lg flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Período de Referência
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  ANO <span className="text-red-400 ml-1">*</span>
                </label>
                <select 
                  required
                  disabled={isViewOnly}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border border-outline-variant/50 rounded-lg px-4 py-2.5 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest w-full text-on-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  MÊS <span className="text-red-400 ml-1">*</span>
                </label>
                <select 
                  required
                  disabled={isViewOnly}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border border-outline-variant/50 rounded-lg px-4 py-2.5 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest w-full text-on-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {[
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                  ].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  DIA <span className="text-red-400 ml-1">*</span>
                </label>
                <select 
                  required 
                  disabled={isViewOnly}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="border border-outline-variant/50 rounded-lg px-4 py-2.5 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest w-full text-on-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {Array.from({ length: 31 }, (_, i) => {
                    const d = String(i + 1).padStart(2, '0');
                    return <option key={d} value={d}>{d}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Units List */}
          <div className="space-y-md">
            <div className="flex justify-between items-end mb-md border-b border-outline-variant/20 pb-md">
              <h4 className="font-label-caps text-label-caps text-on-surface flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                Unidades de Saúde ({UNITS.length})
              </h4>
              <div className="flex flex-col items-end">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Total Parcial</span>
                <span className="font-code-numeral text-xl font-bold text-primary">{totalCount}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-xl gap-y-2">
              {UNITS.map((unit) => (
                <div
                  key={unit}
                  className="grid grid-cols-[minmax(150px,2fr)_auto] items-center py-2.5 border-b border-outline-variant/10 hover:bg-surface-bright/80 px-3 rounded-lg transition-all group"
                >
                  <span className="font-table-data text-table-data text-on-surface/90 group-hover:text-on-surface transition-colors pr-4 break-words">
                    {unit}
                  </span>
                  <div className="flex justify-center">
                    <input
                      disabled={isViewOnly}
                      value={unitCounts[unit] || ""}
                      onChange={(e) => setUnitCounts({ ...unitCounts, [unit]: e.target.value })}
                      className="w-24 border border-outline-variant/50 rounded-lg px-3 py-1.5 font-code-numeral text-center focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest text-on-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      min="0"
                      placeholder="0"
                      type="number"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-6 md:px-xl md:py-lg border-t border-outline-variant/20 flex justify-end gap-md bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="px-xl py-2.5 border border-outline-variant/50 text-on-surface-variant rounded-xl font-label-caps text-[11px] uppercase tracking-wider hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            {isViewOnly ? "Fechar" : "Cancelar"}
          </button>
          {!isViewOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-xl py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] uppercase tracking-wider hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initialData ? "Atualizar Registro" : "Salvar Registro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
