import { X } from "lucide-react";
import { cn } from "../lib/utils";

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
}

export function ShippingModal({ isOpen, onClose, isViewOnly = false }: ShippingModalProps) {
  if (!isOpen) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleString('pt-BR', { month: 'long' });
  const currentDay = String(now.getDate()).padStart(2, '0');

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
                  defaultValue={currentYear}
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
                  defaultValue={currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
                  className="border border-outline-variant/50 rounded-lg px-4 py-2.5 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest w-full text-on-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {[
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                  ].map(month => (
                    <option key={month} value={month}>{month}</option>
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
                  defaultValue={currentDay}
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

          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant/30 mb-md pb-2">
            <div className="grid grid-cols-[2fr_repeat(4,1fr)] gap-4 items-center px-4">
              <h4 className="font-label-caps text-label-caps text-on-surface">Unidade de Saúde</h4>
              {ITEMS.map(item => (
                <span key={item} className="font-label-caps text-[10px] text-on-surface-variant uppercase text-center leading-tight">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Units List */}
          <div className="space-y-1">
            {UNITS.map((unit) => (
              <div
                key={unit}
                className="grid grid-cols-[2fr_repeat(4,1fr)] gap-4 items-center py-2 border-b border-outline-variant/10 hover:bg-surface-bright/50 px-4 rounded-lg transition-all group"
              >
                <span className="font-table-data text-table-data text-on-surface/90 group-hover:text-on-surface transition-colors truncate" title={unit}>
                  {unit}
                </span>
                {ITEMS.map(item => (
                  <div key={item} className="flex justify-center">
                    <input
                      disabled={isViewOnly}
                      className="w-full max-w-[80px] border border-outline-variant/50 rounded-lg px-2 py-1.5 font-code-numeral text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-surface-container-lowest text-on-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      min="0"
                      placeholder="0"
                      type="number"
                    />
                  </div>
                ))}
              </div>
            ))}
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
              onClick={onClose}
              className="px-xl py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] uppercase tracking-wider hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Salvar Envio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
