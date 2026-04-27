import { History as HistoryIcon, Search, Calendar, MapPin, Edit2, Trash2, Clock, X, Lock, Printer, Eye, EyeOff, Plus, CheckCircle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { RegistrationModal } from "./RegistrationModal";
import { cn } from "../lib/utils";
import { pb } from "../lib/pocketbase";
import { Link, useNavigate } from "react-router-dom";

export function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingAction, setPendingAction] = useState<'delete' | 'add' | 'edit' | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("Abril");
  const [selectedDay, setSelectedDay] = useState("");
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      if (!pb.authStore.isValid) {
        await pb.collection('users').authWithPassword(
          import.meta.env.VITE_PB_LOGIN,
          import.meta.env.VITE_PB_PASSWORD
        );
      }
      const records = await pb.collection('testedopezinho_history').getFullList({
        sort: '-created',
      });
      setHistory(records);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setPendingAction('delete');
    setConfirmStep(1);
    setIsPasswordModalOpen(true);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  const confirmAction = async () => {
    if (pendingAction === 'delete' && confirmStep === 1) {
      setConfirmStep(2);
      return;
    }

    if (password === "daps2022") {
      try {
        if (pendingAction === 'delete' && selectedId) {
          await pb.collection('testedopezinho_history').delete(selectedId);
          setHistory(prev => prev.filter(item => item.id !== selectedId));
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else if (pendingAction === 'add') {
          setSelectedRecord(null);
          setIsViewOnly(false);
          setIsModalOpen(true);
        } else if (pendingAction === 'edit') {
          setIsViewOnly(false);
          setIsModalOpen(true);
        }
        setIsPasswordModalOpen(false);
        setPendingAction(null);
        setPassword("");
        setConfirmStep(1);
      } catch (err) {
        setError("Erro ao processar operação no servidor.");
      }
    } else {
      setError("Senha incorreta!");
    }
  };

  const handleView = (record: any) => {
    setSelectedRecord(record);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setSelectedId(record.id);
    setPendingAction('edit');
    setConfirmStep(2);
    setIsPasswordModalOpen(true);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  const handleAddNew = () => {
    setPendingAction('add');
    setConfirmStep(2);
    setIsPasswordModalOpen(true);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  const abbreviate = (name: string) => {
    return name.replace("CENTRO MUNICIPAL DE SAÚDE", "CMS")
               .replace("CLÍNICA DA FAMÍLIA", "CF")
               .replace("HOSPITAL MUNICIPAL", "HM")
               .replace("POLICLÍNICA", "POLI");
  };

  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Filter by date selectors
    filtered = filtered.filter(item => 
      (selectedDay === "" || item.day === selectedDay) &&
      item.month === selectedMonth &&
      item.year === selectedYear
    );

    if (!searchTerm) return filtered;
    const lowerTerm = searchTerm.toLowerCase();
    return filtered.filter(item => 
      item.date.toLowerCase().includes(lowerTerm) ||
      item.units.some(u => u.name.toLowerCase().includes(lowerTerm))
    );
  }, [history, searchTerm, selectedDay, selectedMonth, selectedYear]);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-xl bg-surface-bright relative z-10 w-full min-h-screen">
      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isViewOnly={isViewOnly}
        initialData={selectedRecord}
        onSave={fetchHistory}
      />
      
      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-[#001b3d]/90 z-[100] flex items-center justify-center p-4 transition-all duration-200">
          <div className="bg-[#002b5c] border border-white/20 rounded-[32px] shadow-2xl w-full max-w-[380px] flex-shrink-0 overflow-hidden flex flex-col">
            <div className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              
              {pendingAction === 'delete' && confirmStep === 1 ? (
                <>
                  <h3 className="text-white font-black text-xl text-center mb-2 uppercase tracking-tight">
                    Atenção!
                  </h3>
                  <p className="text-red-400 font-bold text-[13px] text-center mb-8 leading-relaxed uppercase tracking-wider">
                    Esta ação é irreversível. O registro será excluído permanentemente do sistema.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-white font-black text-xl text-center mb-2 uppercase tracking-tight">
                    {pendingAction === 'delete' ? 'Confirmar Exclusão' : 
                     pendingAction === 'add' ? 'Autorizar Novo Envio' : 'Autorizar Edição'}
                  </h3>
                  <p className="text-white/60 text-[13px] text-center mb-8 leading-relaxed">
                    Digite a senha do sistema para prosseguir com esta operação.
                  </p>
                  
                  <div className="w-full space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">SENHA DO SISTEMA</label>
                   <div className="relative">
                     <input
                       placeholder="••••••••"
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all text-center tracking-widest"
                       type={showPassword ? "text" : "password"}
                       autoFocus
                       value={password}
                       onChange={(e) => {
                         setPassword(e.target.value);
                         setError("");
                       }}
                       onKeyDown={(e) => e.key === 'Enter' && confirmAction()}
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                     >
                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                   </div>
                   {error && <p className="text-red-400 text-[11px] font-bold text-center mt-1 uppercase tracking-wider">{error}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-black/20 p-6 flex gap-3">
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPendingAction(null);
                  setPassword("");
                  setError("");
                  setConfirmStep(1);
                }}
                className="flex-1 px-4 py-4 border border-white/10 text-white/60 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAction}
                className={cn(
                  "flex-1 px-4 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all",
                  pendingAction === 'delete' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-primary-container hover:bg-primary-container/90 shadow-primary/20"
                )}
              >
                {pendingAction === 'delete' && confirmStep === 1 ? 'Prosseguir' : 
                 pendingAction === 'delete' ? 'Excluir' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl hidden sm:flex">
            <HistoryIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-h1 font-black text-on-surface">Envio de Exames</h1>
            <p className="text-sm md:text-body-md text-on-surface-variant mt-1 w-full">
              Controle de exames realizados pela rede e histórico de registros.
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto bg-white text-[#001b3d] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#001b3d]/10 hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#001b3d]/5"
        >
          <Plus className="w-5 h-5" />
          Novo Envio
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-6 mb-8">
        {/* Search Bar */}
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por data ou unidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Date Reference Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-white/10 shadow-xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <h4 className="text-[12px] font-black text-white uppercase tracking-[0.15em]">ANO</h4>
            </div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-sm font-bold text-white focus:ring-4 focus:ring-white/10 focus:border-white focus:outline-none transition-all appearance-none cursor-pointer shadow-sm backdrop-blur-md"
            >
              <option className="bg-[#001b3d] text-white">2026</option>
              <option className="bg-[#001b3d] text-white">2025</option>
              <option className="bg-[#001b3d] text-white">2024</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <h4 className="text-[12px] font-black text-white uppercase tracking-[0.15em]">MÊS</h4>
            </div>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-sm font-bold text-white focus:ring-4 focus:ring-white/10 focus:border-white focus:outline-none transition-all appearance-none cursor-pointer shadow-sm backdrop-blur-md"
            >
              {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map(m => (
                <option key={m} value={m} className="bg-[#001b3d] text-white">{m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <h4 className="text-[12px] font-black text-white uppercase tracking-[0.15em]">DIA</h4>
            </div>
            <select 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-sm font-bold text-white focus:ring-4 focus:ring-white/10 focus:border-white focus:outline-none transition-all appearance-none cursor-pointer shadow-sm backdrop-blur-md"
            >
              <option value="" className="bg-[#001b3d] text-white">Todos os dias</option>
              {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                <option key={d} value={d} className="bg-[#001b3d] text-white">{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records Table/List */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="px-xl py-lg font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider text-center">Data / Período</th>
                <th className="px-xl py-lg font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider text-center">Unidades Registradas</th>
                <th className="px-xl py-lg font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider text-center">Total</th>
                <th className="px-xl py-lg font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider text-center">Momento</th>
                <th className="px-xl py-lg font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-xl py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-on-surface-variant font-bold animate-pulse">CARREGANDO HISTÓRICO...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-xl py-20 text-center text-on-surface-variant font-medium">
                    Nenhum registro encontrado para este período.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-bright/50 transition-colors group">
                    <td className="px-xl py-lg align-middle text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-on-surface font-bold">
                          <Calendar className="w-4 h-4 text-primary" />
                          {item.date}
                        </div>
                        <span className="text-[12px] text-on-surface-variant">
                          {item.day} de {item.month}, {item.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-xl py-lg align-middle">
                      <div className="flex flex-wrap justify-center gap-2 max-w-[400px] mx-auto">
                        {(item.units || []).slice(0, 3).map((unit: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-surface-container-high rounded-full text-[11px] font-bold text-on-surface-variant border border-outline-variant/30">
                            {abbreviate(unit.name)}: {unit.count}
                          </span>
                        ))}
                        {(item.units || []).length > 3 && (
                          <span className="px-3 py-1 bg-primary/5 rounded-full text-[11px] font-bold text-primary border border-primary/20">
                            +{(item.units || []).length - 3} unidades
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-xl py-lg align-middle text-center">
                      <div className="font-code-numeral text-lg font-black text-on-surface">
                        {item.totalCount}
                      </div>
                    </td>
                    <td className="px-xl py-lg align-middle text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                          <Clock className="w-3 h-3" />
                          Criado: {item.createdAt}
                        </div>
                        {item.updatedAt !== item.createdAt && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant/60">
                            <Edit2 className="w-2.5 h-2.5" />
                            Editado: {item.updatedAt}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-xl py-lg align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleView(item)}
                          className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-2.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-green-500/20 transition-all duration-300">
          <CheckCircle className="w-6 h-6" />
          <span className="font-black uppercase tracking-widest text-sm">Registro excluído com sucesso!</span>
        </div>
      )}
    </main>
  );
}
