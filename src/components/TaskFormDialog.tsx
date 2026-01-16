"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { FormField } from './ui/form-field';
import { StSelect } from './st-select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

export type TaskFormData = {
  id?: string;
  title: string;
  description?: string;
  dueDate: string;
  executor: 'Cliente' | 'Consultor';
  status?: 'Pendente' | 'Concluida';
};

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  task?: TaskFormData | null;
  onSuccess: () => void;
}

export function TaskFormDialog({
  open,
  onClose,
  clientId,
  task,
  onSuccess,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [executor, setExecutor] = useState<'Cliente' | 'Consultor'>('Cliente');
  const [status, setStatus] = useState<'Pendente' | 'Concluida'>('Pendente');
  const [submitting, setSubmitting] = useState(false);
  const [busyDates, setBusyDates] = useState<Date[]>([]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setDueDate(task.dueDate || '');
        setExecutor(task.executor || 'Cliente');
        setStatus(task.status || 'Pendente');
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setExecutor('Cliente');
        setStatus('Pendente');
      }
    }
  }, [open, task]);

  useEffect(() => {
    if (!dueDate) return;
    setCalendarMonth(new Date(dueDate));
  }, [dueDate]);

  const formatDateParam = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchBusyDates = useCallback(async (monthDate: Date) => {
    if (!clientId || !open) return;

    const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    try {
      setCalendarLoading(true);
      const response = await fetch(
        `/api/schedulings/user/${clientId}?startDate=${formatDateParam(startDate)}&endDate=${formatDateParam(endDate)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Erro ao buscar agenda do cliente');
        return;
      }

      const busy = (Array.isArray(data) ? data : []).map((item) => new Date(item.meetingDate));
      setBusyDates(busy);
    } catch (error) {
      console.error('Error fetching busy dates:', error);
      toast.error('Erro ao buscar agenda do cliente');
    } finally {
      setCalendarLoading(false);
    }
  }, [clientId, open]);

  useEffect(() => {
    if (open) {
      fetchBusyDates(calendarMonth);
    }
  }, [open, calendarMonth, fetchBusyDates]);

  const selectedDate = useMemo(() => {
    if (!dueDate) return undefined;
    const parsed = new Date(dueDate + 'T03:00:00.000Z');
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [dueDate]);

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate) {
      toast.error('Preencha o título e a data de vencimento');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate + 'T03:00:00.000Z',
        executor,
        status: task ? status : undefined,
        clientId,
      };

      const response = await fetch(task?.id ? `/api/tasks/${task.id}` : '/api/tasks', {
        method: task?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Erro ao salvar tarefa');
        return;
      }

      toast.success(task?.id ? 'Tarefa atualizada' : 'Tarefa criada');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Erro ao salvar tarefa');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <FormField
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              placeholder="Ex: Enviar documentos"
            />

            <FormField
              label="Descrição"
              textArea
              value={description}
              onChangeTextArea={(e) => setDescription(e.target.value)}
              disabled={submitting}
              placeholder="Detalhes da tarefa..."
            />

            <FormField
              label="Entrega"
              date
              htmlFor='dueDate'
              value={dueDate}
              onChangeValue={(val) => setDueDate(`${val}`)}
              disabled={submitting}
            />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StSelect 
                label='Executor'
                htmlFor='executor'
                searchable={false}
                value={executor} 
                onChange={(value) => setExecutor(value as 'Cliente' | 'Consultor')}
                items={[{
                    id: 'Cliente', description: 'Cliente'
                },
                {
                    id: 'Consultor', description: 'Consultor'
                }]}
                loading={false}
              />

            {task && (
              <StSelect 
                label='Status'
                htmlFor='status'
                searchable={false}
                value={status} 
                onChange={(value) => setStatus(value as 'Pendente' | 'Concluida')}
                items={[{
                    id: 'Pendente', description: 'Pendente'
                },
                {
                    id: 'Concluida', description: 'Concluída'
                }]}
                loading={false}
              />
            )}
          </div>
          </div>

          <div className="space-y-3 rounded-lg border border-[hsl(var(--app-border))] bg-[hsl(var(--card))]/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Agenda do cliente</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-[hsl(var(--card-accent))] text-[hsl(var(--foreground))] border-[hsl(var(--app-border))]">
                  {calendarLoading ? 'Carregando...' : 'Dias ocupados'}
                </Badge>
              </div>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              onSelect={(date) => {
                if (date) {
                  setDueDate(formatDateParam(date));
                }
              }}
              modifiers={{ busy: busyDates }}
              modifiersClassNames={{
                busy:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-amber-400",
              }}
              className="rounded-md border border-[hsl(var(--app-border))] bg-[hsl(var(--card))]/60"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Clique no dia para selecionar a entrega.</span>
              <span className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
                Compromissos
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {task ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
