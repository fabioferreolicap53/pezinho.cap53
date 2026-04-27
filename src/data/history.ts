
export interface UnitRecord {
  name: string;
  count: number;
}

export interface HistoryRecord {
  id: number;
  date: string;
  day: string;
  month: string;
  year: string;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
  units: UnitRecord[];
}

export const SHARED_HISTORY: HistoryRecord[] = [
  { 
    id: 1, 
    date: "24/04/2026", 
    day: "24",
    month: "Abril", 
    year: "2026", 
    totalCount: 450,
    createdAt: "24/04/2026 08:30",
    updatedAt: "24/04/2026 10:15",
    units: [
      { name: "CF ALICE REGO", count: 15 },
      { name: "CF DEOLINDO COUTO", count: 8 },
      { name: "CF EDSON A. SAAD", count: 12 },
      { name: "CF ERNANI DE P. FERREIRA BRAGA", count: 10 },
      { name: "CF HELANDE DE MELO", count: 7 },
      { name: "CF ILZO MOTTA DE MELO", count: 20 },
      { name: "CF JAMIL HADDAD", count: 14 },
      { name: "CF JOÃO BATISTA CHAGAS", count: 11 },
      { name: "CF JOSÉ ANTÔNIO CIRAUDO", count: 9 },
      { name: "CF LENICE MARIA M. COELHO", count: 13 },
      { name: "CF LOURENÇO DE MELLO", count: 18 },
      { name: "CF SAMUEL PENHA VALLE", count: 22 },
      { name: "CF SÉRGIO AROUCA", count: 16 },
      { name: "CF VALÉRIA GOMES ESTEVES", count: 14 },
      { name: "CF WALDEMAR BERARDINELLI", count: 12 },
      { name: "CMS EMYDIO CABRAL", count: 25 },
      { name: "CMS ADELINO SIMÕES", count: 19 },
      { name: "CMS ALOYSIO AMÂNCIO DA SILVA", count: 11 },
      { name: "CMS CATTAPRETA", count: 30 },
      { name: "CMS CESÁRIO DE MELO", count: 17 },
      { name: "CMS DÉCIO AMARAL FILHO", count: 13 },
      { name: "CMS Dr. CYRO DE MELO", count: 10 },
      { name: "CMS ENFª FLORIPES G. PEREIRA", count: 12 },
      { name: "CMS MARIA APARECIDA ALMEIDA", count: 15 },
      { name: "CMS PROF. SÁVIO ANTUNES", count: 14 },
      { name: "HOSPITAL MUNICIPAL PEDRO II", count: 45 },
      { name: "POLICLÍNICA LINCOLN DE F. FILHO", count: 22 },
    ]
  },
  { 
    id: 2, 
    date: "23/04/2026", 
    day: "23",
    month: "Abril", 
    year: "2026", 
    totalCount: 320,
    createdAt: "23/04/2026 14:20",
    updatedAt: "23/04/2026 14:20",
    units: [
      { name: "CMS EMYDIO CABRAL", count: 120 },
      { name: "CMS CATTAPRETA", count: 200 }
    ]
  },
];

export interface ShippingItem {
  unit: string;
  items: Record<string, number>;
}

export interface ShippingRecord {
  id: number;
  date: string;
  day: string;
  month: string;
  year: string;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  shippings: ShippingItem[];
}

export const SHARED_SHIPPING_HISTORY: ShippingRecord[] = [
  {
    id: 1,
    date: "24/04/2026",
    day: "24",
    month: "Abril",
    year: "2026",
    totalItems: 150,
    createdAt: "24/04/2026 09:00",
    updatedAt: "24/04/2026 09:00",
    shippings: [
      { unit: "CF ALICE REGO", items: { "Filtro Vermelho": 20, "Filtro Azul": 20, "Lanceta": 50, "Envelope": 10 } },
      { unit: "CF DEOLINDO COUTO", items: { "Filtro Vermelho": 10, "Filtro Azul": 10, "Lanceta": 25, "Envelope": 5 } }
    ]
  }
];
