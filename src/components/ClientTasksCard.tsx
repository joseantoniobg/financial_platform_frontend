"use client";

import { useEffect, useState } from 'react';
import { StCard } from '@/components/StCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  executor: 'Cliente' | 'Consultor';
  status: 'Pendente' | 'Concluida';
}

export function ClientTasksCard() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks/my');
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Erro ao buscar tarefas');
        return;
      }

      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao buscar tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleMarkDone = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Concluida' }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Erro ao atualizar status');
        return;
      }

      toast.success('Tarefa concluída');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const pendingCount = tasks.filter((task) => task.status === 'Pendente').length;

  return (
    <StCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tarefas</span>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">{pendingCount}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          Ver tarefas
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando tarefas...</div>
      ) : tasks.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada.</div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Você tem {pendingCount} tarefa(s) pendente(s).
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(value) => !value && setDialogOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Minhas tarefas</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-6 text-center text-muted-foreground">Carregando tarefas...</div>
          ) : tasks.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">Nenhuma tarefa encontrada.</div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Vencimento: {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <Badge className={task.status === 'Concluida' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}>
                      {task.status}
                    </Badge>
                  </div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                  )}
                  {task.status === 'Pendente' && task.executor === 'Cliente' && (
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleMarkDone(task.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StCard>
  );
}
