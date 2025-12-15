'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StTable } from '@/components/st-table';
import { DashboardLayout } from '@/components/DashboardLayout';

interface MeetingReason {
  id: string;
  name: string;
  description?: string;
}

export default function MeetingReasonsPage() {
  const [reasons, setReasons] = useState<MeetingReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<MeetingReason | null>(null);
  const [deletingReason, setDeletingReason] = useState<MeetingReason | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meeting-reasons');
      if (!response.ok) throw new Error('Erro ao carregar motivos');
      const data = await response.json();
      setReasons(data);
    } catch (error) {
      toast.error('Erro ao carregar motivos de reunião');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReason(null);
    setName('');
    setDescription('');
    setDialogOpen(true);
  };

  const handleEdit = (reason: MeetingReason) => {
    setEditingReason(reason);
    setName(reason.name);
    setDescription(reason.description || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingReason
        ? `/api/meeting-reasons/${editingReason.id}`
        : '/api/meeting-reasons';

      const method = editingReason ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar motivo');

      toast.success(
        editingReason
          ? 'Motivo atualizado com sucesso'
          : 'Motivo criado com sucesso'
      );

      setDialogOpen(false);
      fetchReasons();
    } catch (error) {
      toast.error('Erro ao salvar motivo de reunião');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingReason) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/meeting-reasons/${deletingReason.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar motivo');

      toast.success('Motivo removido com sucesso');
      setDeletingReason(null);
      fetchReasons();
    } catch (error) {
      toast.error('Erro ao deletar motivo de reunião');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Motivos de Reunião</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os motivos disponíveis para agendamentos
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Motivo
        </Button>
      </div>

      <div className="border rounded-lg">
         <StTable
            colunmNames={['Nome', 'Descrição', 'Ações']}
            items={reasons.map((reason) => ({
              name: reason.name,
              description: reason.description || '-',
                actions: (<div className="flex justify-end gap-2">
                  <Button
                    variant="edit"
                    size="sm"
                    onClick={() => handleEdit(reason)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingReason(reason)}
                  >
                    <Trash2 className="h-4 w-" />
                  </Button>
                </div>),
                id: reason.id,
            }))}
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReason ? 'Editar Motivo' : 'Novo Motivo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Planejamento Financeiro"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do motivo da reunião"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingReason}
        onOpenChange={(open) => !open && setDeletingReason(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o motivo &quot;{deletingReason?.name}&quot;?
              Esta ação não pode ser desfeita e impedirá a criação de novos agendamentos
              com este motivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
