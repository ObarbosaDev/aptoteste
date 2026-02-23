import { User, Package, Visitor, Reservation, Notice, Occurrence } from "@/types";

export const mockUsers: User[] = [
  { id: "1", name: "Carlos Silva", email: "sindico@condo.com", role: "sindico", avatar: "" },
  { id: "2", name: "João Santos", email: "porteiro@condo.com", role: "porteiro", avatar: "" },
  { id: "3", name: "Maria Oliveira", email: "morador@condo.com", role: "morador", unit: "101", block: "A", avatar: "" },
];

export const mockPackages: Package[] = [
  { id: "p1", type: "caixa", description: "Amazon - Eletrônicos", residentId: "3", residentName: "Maria Oliveira", unit: "101", block: "A", status: "pendente", receivedAt: "2026-02-23T10:30:00" },
  { id: "p2", type: "envelope", description: "Correspondência bancária", residentId: "3", residentName: "Maria Oliveira", unit: "101", block: "A", status: "pendente", receivedAt: "2026-02-22T14:00:00" },
  { id: "p3", type: "sacola", description: "Mercado Livre - Roupas", residentId: "r2", residentName: "Pedro Costa", unit: "202", block: "B", status: "pendente", receivedAt: "2026-02-23T08:15:00" },
  { id: "p4", type: "caixa", description: "Shopee - Decoração", residentId: "r3", residentName: "Ana Souza", unit: "303", block: "A", status: "retirada", receivedAt: "2026-02-20T09:00:00", pickedUpAt: "2026-02-20T18:30:00", pickedUpBy: "Ana Souza" },
  { id: "p5", type: "outro", description: "Flores - Presente", residentId: "r4", residentName: "Lucas Lima", unit: "104", block: "C", status: "retirada", receivedAt: "2026-02-19T11:00:00", pickedUpAt: "2026-02-19T17:00:00", pickedUpBy: "Lucas Lima" },
  { id: "p6", type: "envelope", description: "Documento jurídico", residentId: "r5", residentName: "Fernanda Dias", unit: "501", block: "B", status: "pendente", receivedAt: "2026-02-23T07:45:00" },
];

export const mockVisitors: Visitor[] = [
  { id: "v1", name: "Roberto Almeida", document: "123.456.789-00", unit: "101", block: "A", residentName: "Maria Oliveira", entryAt: "2026-02-23T09:00:00", status: "dentro" },
  { id: "v2", name: "Camila Ferreira", document: "987.654.321-00", unit: "202", block: "B", residentName: "Pedro Costa", entryAt: "2026-02-23T10:30:00", exitAt: "2026-02-23T12:00:00", status: "saiu" },
  { id: "v3", name: "Diego Martins", document: "456.789.123-00", unit: "303", block: "A", residentName: "Ana Souza", entryAt: "2026-02-23T14:00:00", status: "dentro", vehicle: "ABC-1234" },
  { id: "v4", name: "Juliana Rocha", document: "321.654.987-00", unit: "104", block: "C", residentName: "Lucas Lima", entryAt: "2026-02-22T16:00:00", exitAt: "2026-02-22T19:00:00", status: "saiu" },
];

export const mockReservations: Reservation[] = [
  { id: "res1", space: "Salão de Festas", residentId: "3", residentName: "Maria Oliveira", unit: "101", block: "A", date: "2026-03-01", startTime: "14:00", endTime: "22:00", status: "aprovada" },
  { id: "res2", space: "Churrasqueira", residentId: "r2", residentName: "Pedro Costa", unit: "202", block: "B", date: "2026-03-05", startTime: "10:00", endTime: "18:00", status: "pendente" },
  { id: "res3", space: "Quadra Esportiva", residentId: "r3", residentName: "Ana Souza", unit: "303", block: "A", date: "2026-02-28", startTime: "08:00", endTime: "10:00", status: "aprovada" },
  { id: "res4", space: "Salão de Festas", residentId: "r4", residentName: "Lucas Lima", unit: "104", block: "C", date: "2026-03-10", startTime: "18:00", endTime: "23:00", status: "rejeitada", notes: "Conflito com manutenção programada" },
];

export const mockNotices: Notice[] = [
  { id: "n1", title: "Manutenção do elevador - Bloco A", content: "Informamos que o elevador do Bloco A passará por manutenção preventiva no dia 25/02. O serviço será realizado das 8h às 12h.", authorId: "1", authorName: "Carlos Silva", createdAt: "2026-02-23T08:00:00", isNew: true, type: "aviso" },
  { id: "n2", title: "Assembleia Geral Ordinária", content: "Convocamos todos os condôminos para a Assembleia Geral Ordinária que será realizada no Salão de Festas. Pauta: Prestação de contas 2025 e eleição do novo conselho.", authorId: "1", authorName: "Carlos Silva", createdAt: "2026-02-20T10:00:00", isNew: true, type: "assembleia", date: "2026-03-15", location: "Salão de Festas" },
  { id: "n3", title: "Horário da piscina atualizado", content: "A partir de março, o horário de funcionamento da piscina será das 7h às 21h.", authorId: "1", authorName: "Carlos Silva", createdAt: "2026-02-18T14:00:00", isNew: false, type: "aviso" },
];

export const mockOccurrences: Occurrence[] = [
  { id: "o1", type: "barulho", title: "Barulho excessivo apt 302A", description: "Som alto após as 22h no apartamento 302 do Bloco A, acontecendo há 3 dias seguidos.", residentId: "3", residentName: "Maria Oliveira", unit: "101", block: "A", status: "aberta", createdAt: "2026-02-22T23:00:00", timeline: [{ date: "2026-02-22T23:00:00", action: "Ocorrência registrada", by: "Maria Oliveira" }] },
  { id: "o2", type: "manutencao", title: "Vazamento no teto da garagem", description: "Há um vazamento no teto da garagem no nível B2, próximo à vaga 45.", residentId: "r2", residentName: "Pedro Costa", unit: "202", block: "B", status: "em_andamento", createdAt: "2026-02-20T08:00:00", timeline: [{ date: "2026-02-20T08:00:00", action: "Ocorrência registrada", by: "Pedro Costa" }, { date: "2026-02-21T10:00:00", action: "Equipe de manutenção acionada", by: "Carlos Silva" }] },
  { id: "o3", type: "seguranca", title: "Porta do bloco B não tranca", description: "A fechadura eletrônica da porta principal do Bloco B não está funcionando corretamente.", residentId: "r3", residentName: "Ana Souza", unit: "303", block: "A", status: "resolvida", createdAt: "2026-02-15T16:00:00", timeline: [{ date: "2026-02-15T16:00:00", action: "Ocorrência registrada", by: "Ana Souza" }, { date: "2026-02-16T09:00:00", action: "Técnico agendado para visita", by: "Carlos Silva" }, { date: "2026-02-17T14:00:00", action: "Fechadura substituída. Problema resolvido.", by: "Carlos Silva" }] },
];

// Chart data
export const packagesByMonth = [
  { month: "Set", total: 45 }, { month: "Out", total: 62 }, { month: "Nov", total: 58 },
  { month: "Dez", total: 89 }, { month: "Jan", total: 73 }, { month: "Fev", total: 54 },
];

export const occurrencesByType = [
  { type: "Barulho", total: 12 }, { type: "Manutenção", total: 8 }, { type: "Segurança", total: 5 },
  { type: "Limpeza", total: 3 }, { type: "Outro", total: 4 },
];
