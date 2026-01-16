"use client";

import { useState } from 'react';
import { StCard } from '@/components/StCard';
import { StTable } from '@/components/st-table';
import { PageTitle } from '@/components/ui/page-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarPlus, ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SchedulingFormDialog } from '@/components/SchedulingFormDialog';
import { TaskManagerDialog } from '@/components/TaskManagerDialog';

export type FollowUpItem = {
  id: string;
  name: string;
  status: string;
  lastMeeting?: string | null;
  nextMeeting?: string | null;
  nextTaskDue?: string | null;
  pendingTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  daysWithoutContact?: number;
};

interface ConsultantFollowUpProps {
  followUps: FollowUpItem[];
  onRefresh: () => void;
}

export function ConsultantFollowUp({ followUps, onRefresh }: ConsultantFollowUpProps) {
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);

  const handleOpenSchedule = (client: { id: string; name: string }) => {
    setSelectedClient(client);
    setScheduleOpen(true);
  };

  const handleOpenTasks = (client: { id: string; name: string }) => {
    setSelectedClient(client);
    setTasksOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Em dia':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Tarefas vencidas':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Risco de cancelamento':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <StCard className="p-4 space-y-4">
      <PageTitle title="Follow-up de Carteira" fontSize="text-lg" />

      <StTable
        colunmNames={['Cliente', 'Reuniões', 'Status', 'Próximas ações']}
        items={followUps.map((item) => ({
          client: (
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.pendingTasks} tarefa(s) pendente(s)
              </span>
            </div>
          ),
          meetings: (
            <div className="flex flex-col text-sm text-muted-foreground">
              <span>Última: {item.lastMeeting ? formatDate(item.lastMeeting) : '—'}</span>
              <span>Próxima: {item.nextMeeting ? formatDate(item.nextMeeting) : '—'}</span>
            </div>
          ),
          status: (
            <div className="flex flex-col gap-1">
              <Badge className={getStatusBadgeClass(item.status)}>{item.status}</Badge>
              {item.nextTaskDue && (
                <span className="text-xs text-muted-foreground">
                  Próxima tarefa: {formatDate(item.nextTaskDue)}
                </span>
              )}
            </div>
          ),
          actions: (
            <div className="flex items-center gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => handleOpenSchedule({ id: item.id, name: item.name })}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Agendar
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleOpenTasks({ id: item.id, name: item.name })}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Tarefas
              </Button>
            </div>
          ),
          id: item.id,
        }))}
      />

      <SchedulingFormDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        scheduling={null}
        onSuccess={onRefresh}
        defaultClientId={selectedClient?.id}
      />

      <TaskManagerDialog
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        client={selectedClient}
        onUpdated={onRefresh}
      />
    </StCard>
  );
}
