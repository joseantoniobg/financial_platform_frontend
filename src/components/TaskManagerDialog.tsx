"use client";

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, CheckCircle2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import { TaskFormDialog, TaskFormData } from './TaskFormDialog';

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  executor: 'Cliente' | 'Consultor';
  status: 'Pendente' | 'Concluida';
};

interface TaskManagerDialogProps {
  open: boolean;
  onClose: () => void;
  client: { id: string; name: string; email?: string } | null;
  onUpdated: () => void;
}

export function TaskManagerDialog({ open, onClose, client, onUpdated }: TaskManagerDialogProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!client?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/client/${client.id}`);
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
  }, [client?.id]);

  useEffect(() => {
    if (open) {
      fetchTasks();
    }
  }, [open, fetchTasks]);

  const handleCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingTask) return;

    try {
      const response = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Erro ao remover tarefa');
        return;
      }

      toast.success('Tarefa removida');
      setDeletingTask(null);
      fetchTasks();
      onUpdated();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao remover tarefa');
    }
  };

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
      onUpdated();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const taskToFormData = (task: TaskItem): TaskFormData => ({
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate?.split('T')[0] || task.dueDate,
    executor: task.executor,
    status: task.status,
  });

  const getStatusBadge = (status: TaskItem['status']) => {
    return status === 'Concluida'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gestão de tarefas - {client?.name}</DialogTitle>
          </DialogHeader>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {tasks.length} tarefa(s) cadastrada(s)
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova tarefa
            </Button>
          </div>

          {loading ? (
            <div className="py-6 text-center text-muted-foreground">Carregando tarefas...</div>
          ) : tasks.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">Nenhuma tarefa encontrada.</div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Vencimento: {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(task.status)}>{task.status}</Badge>
                      <Badge variant="outline">{task.executor}</Badge>
                    </div>
                  </div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                  )}
                  <div className="flex flex-wrap gap-2 justify-end">
                    {task.status === 'Pendente' && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkDone(task.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingTask(task)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TaskFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        clientId={client?.id || ''}
        task={editingTask ? taskToFormData(editingTask) : null}
        onSuccess={() => {
          fetchTasks();
          onUpdated();
        }}
      />

      <AlertDialog open={!!deletingTask} onOpenChange={(value) => !value && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTask(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
