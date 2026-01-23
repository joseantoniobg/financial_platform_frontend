"use client";

import { useEffect, useState } from 'react';
import { StCard } from '@/components/StCard';
import { StTable } from '@/components/st-table';
import { PageTitle } from '@/components/ui/page-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarPlus, ClipboardList, Trash2, LucideSave } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SchedulingFormDialog } from '@/components/SchedulingFormDialog';
import { TaskManagerDialog } from '@/components/TaskManagerDialog';
import { toast } from 'react-hot-toast';

export type FollowUpItem = {
  id: string;
  name: string;
  status: string;
  lastMeeting?: string | null;
  nextMeeting?: string | null;
  nextTaskDue?: string | null;
  followUpNotes?: string | null;
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
  const [notesState, setNotesState] = useState<
    Record<string, { value: string; draft: string; focused: boolean; saving: boolean }>
  >({});

  useEffect(() => {
    setNotesState((prev) => {
      const nextState = { ...prev };

      followUps.forEach((item) => {
        const incomingValue = item.followUpNotes ?? '';
        const current = nextState[item.id];

        if (!current) {
          nextState[item.id] = {
            value: incomingValue,
            draft: incomingValue,
            focused: false,
            saving: false,
          };
          return;
        }

        if (!current.focused && current.value === current.draft && current.value !== incomingValue) {
          nextState[item.id] = {
            ...current,
            value: incomingValue,
            draft: incomingValue,
          };
        }
      });

      return nextState;
    });
  }, [followUps]);

  const handleOpenSchedule = (client: { id: string; name: string }) => {
    setSelectedClient(client);
    setScheduleOpen(true);
  };

  const handleOpenTasks = (client: { id: string; name: string }) => {
    setSelectedClient(client);
    setTasksOpen(true);
  };

  const getNotesState = (id: string) =>
    notesState[id] ?? {
      value: '',
      draft: '',
      focused: false,
      saving: false,
    };

  const updateNotesState = (
    id: string,
    updater: (current: { value: string; draft: string; focused: boolean; saving: boolean }) => {
      value: string;
      draft: string;
      focused: boolean;
      saving: boolean;
    }
  ) => {
    setNotesState((prev) => {
      const current = prev[id] ?? { value: '', draft: '', focused: false, saving: false };
      return {
        ...prev,
        [id]: updater(current),
      };
    });
  };

  const handleSaveNotes = async (id: string) => {
    const current = getNotesState(id);

    updateNotesState(id, (state) => ({
      ...state,
      saving: true,
    }));

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpNotes: current.draft }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message || 'Erro ao salvar observações');
        updateNotesState(id, (state) => ({
          ...state,
          saving: false,
        }));
        return;
      }

      updateNotesState(id, (state) => ({
        ...state,
        value: state.draft,
        focused: false,
        saving: false,
      }));

      toast.success('Observações salvas');
    } catch (error) {
      console.error('Error saving follow-up notes:', error);
      toast.error('Erro ao salvar observações');
      updateNotesState(id, (state) => ({
        ...state,
        saving: false,
      }));
    }
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
        colunmNames={['Cliente', 'Reuniões', 'Status', 'Observações', 'Próximas ações']}
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
          notes: (() => {
            const noteState = getNotesState(item.id);
            const displayValue = noteState.focused ? noteState.draft : noteState.value;

            return (
              <div
                className="flex gap-2"
                onFocusCapture={() =>
                  updateNotesState(item.id, (current) => ({
                    ...current,
                    focused: true,
                    draft: current.draft || current.value,
                  }))
                }
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    updateNotesState(item.id, (current) => ({
                      ...current,
                      focused: false,
                    }));
                  }
                }}
              >
                <textarea
                  rows={2}
                  value={displayValue}
                  onChange={(event) =>
                    updateNotesState(item.id, (current) => ({
                      ...current,
                      draft: event.target.value,
                    }))
                  }
                  className="min-h-[72px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {noteState.focused && (
                  <div className="flex items-center flex-col justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={noteState.saving}
                      onClick={() => handleSaveNotes(item.id)}
                    >
                      <LucideSave className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        updateNotesState(item.id, () => ({
                          draft: '',
                          value: noteState.value,
                          focused: true,
                          saving: false,
                        }))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })(),
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
