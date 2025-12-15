export type SchedulingStatus = 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado' | 'Não Compareceu';

export interface Scheduling {
  id: string;
  userId: string;
  clientId?: string;
  meetingReasonId: string;
  meetingDate: string;
  endDate: string;
  status: SchedulingStatus;
  observations?: string;
  user?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
  meetingReason?: {
    id: string;
    name: string;
  };
}