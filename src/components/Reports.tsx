import { FileText, Download, Filter, Search } from "lucide-react";

export function Reports() {
  return (
    <main className="flex-1 overflow-y-auto p-xl bg-surface-bright relative z-10 w-full min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Relatórios</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Geração e consulta de relatórios consolidados.
          </p>
        </div>
        <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-caps text-label-caps hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2 shadow-sm">
          <Download className="w-[18px] h-[18px]" />
          Exportar Dados
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-xl flex flex-wrap gap-md items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar relatório..."
            className="w-full pl-10 pr-4 py-2 bg-surface-bright border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="flex items-center gap-2 px-md py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-bright transition-colors">
          <Filter className="w-4 h-4" />
          Filtros Avançados
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {[
          { title: "Consolidado Mensal", desc: "Resumo total de testes por unidade no mês.", icon: <FileText className="w-6 h-6" /> },
          { title: "Desempenho por Unidade", desc: "Comparativo de metas e produtividade.", icon: <FileText className="w-6 h-6" /> },
          { title: "Série Histórica", desc: "Evolução anual dos testes realizados.", icon: <FileText className="w-6 h-6" /> },
        ].map((report, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
              <div className="text-on-primary-fixed">{report.icon}</div>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-2">{report.title}</h3>
            <p className="font-body-md text-on-surface-variant mb-md">{report.desc}</p>
            <button className="text-primary font-label-caps text-[11px] uppercase tracking-wider hover:underline">
              Visualizar Relatório
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
