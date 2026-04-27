import { X, Save, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
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

const ITEMS = [
  "Filtro Vermelho",
  "Filtro Azul",
  "Lanceta",
  "Envelope"
];

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isViewOnly?: boolean;
  initialData?: any;
  onSave?: () => void;
}

export function ShippingModal({ isOpen, onClose, isViewOnly = false, initialData, onSave }: ShippingModalProps) {
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("Abril");
  const [day, setDay] = useState("");
  const [shippings, setShippings] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setYear(initialData.year || "2026");
      setMonth(initialData.month || "Abril");
      setDay(initialData.day || "");
      const shippingData: Record<string, Record<string, string>> = {};
      (initialData.shippings || []).forEach((s: any) => {
        shippingData[s.unit] = {};
        Object.entries(s.items).forEach(([item, count]) => {
          shippingData[s.unit][item] = String(count);
        });
      });
      setShippings(shippingData);
    } else {
      const now = new Date();
      setYear("2026");
      setMonth("Abril");
      setDay(String(now.getDate()).padStart(2, '0'));
      setShippings({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const totalItems = Object.values(shippings).reduce((acc, unitItems) => {
    return acc + Object.values(unitItems).reduce((uAcc, count) => uAcc + (Number(count) || 0), 0);
  }, 0);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const authenticated = await ensureAuth();
      if (!authenticated) {
        alert("Falha na autenticação com o servidor.");
        setIsSaving(false);
        return;
      }

      // Impedir duplicatas na mesma data (exceto se for edição)
      if (!initialData?.id) {
        const existing = await pb.collection('testedopezinho_shipping').getList(1, 1, {
          filter: `year = "${year}" && month = "${month}" && day = "${day}"`,
          requestKey: null
        });

        if (existing.items.length > 0) {
          alert(`Já existe um registro de insumos para a data ${day} de ${month} de ${year}.`);
          setIsSaving(false);
          return;
        }
      }

      const shippingList = UNITS.map(unit => {
        const items: Record<string, number> = {};
        let hasItems = false;
        ITEMS.forEach(item => {
          const count = Number(shippings[unit]?.[item]) || 0;
          if (count > 0) {
            items[item] = count;
            hasItems = true;
          }
        });
        return hasItems ? { unit, items } : null;
      }).filter(s => s !== null);

      const monthIndex = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].indexOf(month) + 1;
      const formattedDate = `${day}/${String(monthIndex).padStart(2, '0')}/${year}`;

      const data = {
        date: formattedDate,
        day,
        month,
        year,
        totalItems,
        shippings: shippingList,
        createdAt: initialData?.createdAt || new Date().toLocaleString('pt-BR'),
        updatedAt: new Date().toLocaleString('pt-BR')
      };

      if (initialData?.id) {
        await pb.collection('testedopezinho_shipping').update(initialData.id, data, { requestKey: null });
      } else {
        await pb.collection('testedopezinho_shipping').create(data, { requestKey: null });
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

  const handleCountChange = (unit: string, item: string, value: string) => {
    setShippings(prev => ({
      ...prev,
      [unit]: {
        ...(prev[unit] || {}),
        [item]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-[#001b3d]/80 z-50 flex items-center justify-center p-0 md:p-8 backdrop-blur-sm transition-all duration-300">
      <div className="bg-surface-container-lowest rounded-none md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] flex flex-col border border-outline-variant/30 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-6 md:px-xl md:py-lg border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
          <div>
            <h3 className="font-h2 text-h2 text-on-surface">
              Envio de Insumos às Unidades
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Registre a saída de materiais para as unidades de saúde.
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
              Data do Envio
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
                  {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  DIA <span className="text-red-400 ml-1">*</span>
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  max="31"
                  disabled={isViewOnly}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="00"
                  className="border border-outline-variant/50 rounded-lg px-4 py-2.5 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest w-full text-on-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Unit Items Input */}
          <div className="bg-surface-bright/50 p-lg border border-outline-variant/30 rounded-xl shadow-sm">
            <h4 className="font-label-caps text-label-caps text-on-surface mb-lg flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Materiais por Unidade
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-4 px-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">Unidade</th>
                    {ITEMS.map(item => (
                      <th key={item} className="text-center py-4 px-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">{item}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {UNITS.map(unit => (
                    <tr key={unit} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="py-4 px-4 font-body-md text-on-surface font-medium">{unit}</td>
                      {ITEMS.map(item => (
                        <td key={item} className="py-2 px-2">
                          <input 
                            type="number"
                            min="0"
                            disabled={isViewOnly}
                            value={shippings[unit]?.[item] || ""}
                            onChange={(e) => handleCountChange(unit, item, e.target.value)}
                            placeholder="0"
                            className="w-20 mx-auto border border-outline-variant/30 rounded-lg px-2 py-1.5 text-center font-code-numeral focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest text-on-surface transition-all disabled:opacity-50"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-6 md:px-xl md:py-lg border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">TOTAL DE ITENS</span>
              <span className="text-2xl font-black text-primary font-code-numeral">{totalItems}</span>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-all border border-outline-variant/30"
            >
              {isViewOnly ? "FECHAR" : "CANCELAR"}
            </button>
            {!isViewOnly && (
              <button
                onClick={handleSave}
                disabled={isSaving || totalItems === 0}
                className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    SALVANDO...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    SALVAR ENVIO
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
