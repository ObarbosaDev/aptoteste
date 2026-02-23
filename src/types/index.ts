export type UserRole = "sindico" | "porteiro" | "morador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  unit?: string;
  block?: string;
}

export type PackageStatus = "pendente" | "retirada" | "devolvida";
export type PackageType = "caixa" | "envelope" | "sacola" | "outro";

export interface Package {
  id: string;
  type: PackageType;
  description: string;
  residentId: string;
  residentName: string;
  unit: string;
  block: string;
  status: PackageStatus;
  photo?: string;
  receivedAt: string;
  pickedUpAt?: string;
  pickedUpBy?: string;
  signature?: string;
}

export type VisitorStatus = "dentro" | "saiu";

export interface Visitor {
  id: string;
  name: string;
  document: string;
  unit: string;
  block: string;
  residentName: string;
  entryAt: string;
  exitAt?: string;
  status: VisitorStatus;
  vehicle?: string;
}

export type ReservationStatus = "pendente" | "aprovada" | "rejeitada";

export interface Reservation {
  id: string;
  space: string;
  residentId: string;
  residentName: string;
  unit: string;
  block: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isNew: boolean;
  type: "aviso" | "assembleia";
  date?: string;
  location?: string;
}

export type OccurrenceStatus = "aberta" | "em_andamento" | "resolvida";
export type OccurrenceType = "barulho" | "manutencao" | "seguranca" | "limpeza" | "outro";

export interface Occurrence {
  id: string;
  type: OccurrenceType;
  title: string;
  description: string;
  residentId: string;
  residentName: string;
  unit: string;
  block: string;
  status: OccurrenceStatus;
  createdAt: string;
  photo?: string;
  timeline: OccurrenceEvent[];
}

export interface OccurrenceEvent {
  date: string;
  action: string;
  by: string;
}
