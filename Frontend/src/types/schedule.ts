export type ShiftType = 'Manhã' | 'Tarde' | 'Noite' | 'Integral';

export type ScheduleStatus = 'Planejada' | 'Em andamento' | 'Concluída' | 'Cancelada';

export interface ScheduleCardProps {
  id: number;
  classCode: string;           // ex: "APB/149/02"
  courseName: string;          // ex: "Operador de Mina"
  disciplineName: string;      // ex: "Topografia Aplicada à Mineração"
  companyName?: string;        // ex: "Vale - Carajás"
  startDate: string;           // ex: "04/09/2026"
  endDate: string;             // ex: "17/09/2026"
  sharepointUrl?: string;      // ex: "https://senaipa.sharepoint..."
  environmentName: string;     // ex: "FAMAP"
  shift: ShiftType;            // ex: "Tarde"
  status: ScheduleStatus;      // ex: "Em andamento"
  createdAtFormatted: string;  // ex: "15/09/2026 8:39"
  createdBy?: string;
  onCardClick?: (id: number) => void;
}