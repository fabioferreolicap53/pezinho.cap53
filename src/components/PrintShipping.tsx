import { Printer, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ITEMS = [
  "Filtro Vermelho",
  "Filtro Azul",
  "Lanceta",
  "Envelope"
];

export function PrintShipping() {
  const location = useLocation();
  const shippingData = location.state?.shipping;

  if (!shippingData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <p className="text-[#001b3d] font-bold mb-4">Nenhum dado de envio encontrado.</p>
        <Link to="/envio-unidades" className="px-6 py-2 bg-[#001b3d] text-white rounded-xl font-bold">
          Voltar ao Envio
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Envio_Insumos_${shippingData.day}_${shippingData.month}_${shippingData.year}`;
    window.print();
    document.title = originalTitle;
  };

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
        {/* Blue Header Banner */}
        <div className="bg-[#001b3d] p-6 flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-[#001b3d] rounded-lg flex items-center justify-center font-black text-white text-2xl italic">
                RIO
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight tracking-tight uppercase">Saúde Pública Carioca</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-[1px] w-6 bg-white/30"></span>
                <p className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-bold">Prefeitura do Rio de Janeiro</p>
              </div>
            </div>
          </div>
          <div className="text-right relative z-10 hidden sm:block">
            <p className="text-xs font-bold italic">CAP 5.3 / DAPS</p>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-10 space-y-10 font-serif text-[#001b3d]">
          <div className="space-y-3 text-center">
            <div className="inline-block px-4 py-1 border-2 border-[#001b3d] text-[10px] font-black uppercase tracking-widest mb-2">
              Consolidado de Insumos
            </div>
            <div className="space-y-1 text-[15px]">
              <p className="font-bold text-xs opacity-80">De: S/SUBPAV/CAP 5.3 / DAPS</p>
              <p className="font-black text-xl uppercase underline underline-offset-8 decoration-4">
                DATA: {shippingData.day} / {shippingData.month} / {shippingData.year}
              </p>
              <p className="font-bold text-sm mt-2">Assunto: Encaminhamento de Insumos às Unidades</p>
            </div>
          </div>

          <div className="space-y-3 text-[14px] leading-relaxed max-w-2xl mx-auto text-center italic">
            <p>
              Informamos que estamos encaminhando os insumos para o <span className="font-black not-italic">Programa de Triagem Neonatal</span>, 
              referentes às Unidades de Saúde da <span className="font-black not-italic">CAP 5.3</span> listadas abaixo:
            </p>
          </div>

          {/* Table */}
          <div className="border-[2px] border-[#001b3d]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#001b3d] text-white">
                  <th className="py-2.5 px-6 text-[11px] font-black uppercase border-r border-white/20 tracking-[0.2em] text-left">Unidade de Saúde</th>
                  {ITEMS.map(item => (
                    <th key={item} className="py-2.5 px-4 text-[11px] font-black uppercase border-r border-white/20 tracking-tighter text-center">
                      {item.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {shippingData.shippings.map((ship, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#001b3d]/[0.02]"}>
                    <td className="py-1.5 px-6 font-bold text-left border-r border-[#001b3d]/10 border-b border-b-[#001b3d]/5 uppercase tracking-tight">
                      {ship.unit}
                    </td>
                    {ITEMS.map(item => (
                      <td key={item} className="py-1.5 px-4 font-black text-center border-r border-[#001b3d]/10 border-b border-b-[#001b3d]/5 text-sm">
                        {ship.items[item] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#001b3d] text-white">
                  <td className="py-3 px-6 text-[12px] font-black uppercase border-r border-white/20 text-right tracking-widest">
                    Totais
                  </td>
                  {ITEMS.map(item => (
                    <td key={item} className="py-3 px-4 text-base font-black text-center bg-[#001b3d] border-r border-white/10">
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
