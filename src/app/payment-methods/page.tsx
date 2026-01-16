'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { StLoading } from '@/components/StLoading';
import { PageTitle } from '@/components/ui/page-title';
import { TopAddButton } from '@/components/ui/top-add-button';
import { StTable } from '@/components/st-table';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { StSelect } from '@/components/st-select';
import { StCheckInput } from '@/components/StCheckInput';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  paymentType: 'Dinheiro' | 'Pix' | 'Cartão de Crédito / Débito';
  name: string;
  isActive: boolean;
  createdAt: string;
}

type DialogMode = 'create' | 'edit';

const paymentTypeOptions = [
  { id: 'Dinheiro', description: 'Dinheiro' },
  { id: 'Pix', description: 'Pix' },
  { id: 'Cartão de Crédito / Débito', description: 'Cartão de Crédito / Débito' },
];

export default function PaymentMethodsPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    paymentType: '' as PaymentMethod['paymentType'] | '',
    isActive: true,
  });

  const isAdmin = user?.roles?.some((role) => role.name === 'Administrador');

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payment-methods');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPaymentMethods(data);
    } catch {
      toast.error('Erro ao carregar métodos de pagamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchPaymentMethods();
    }
  }, [isAuthenticated, isAdmin, fetchPaymentMethods]);

  const handleCreate = () => {
    setDialogMode('create');
    setCurrentPaymentMethod(null);
    setFormData({
      name: '',
      paymentType: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setDialogMode('edit');
    setCurrentPaymentMethod(method);
    setFormData({
      name: method.name,
      paymentType: method.paymentType,
      isActive: method.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.paymentType) {
      toast.error('Tipo de pagamento é obrigatório');
      return;
    }

    try {
      setSubmitting(true);

      const url =
        dialogMode === 'create'
          ? '/api/payment-methods'
          : `/api/payment-methods/${currentPaymentMethod?.id}`;

      const method = dialogMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error?.message || 'Erro ao salvar método de pagamento');
        return;
      }

      toast.success(
        dialogMode === 'create'
          ? 'Método de pagamento criado com sucesso!'
          : 'Método de pagamento atualizado com sucesso!'
      );

      setDialogOpen(false);
      fetchPaymentMethods();
    } catch {
      toast.error('Erro ao salvar método de pagamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/payment-methods/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error?.message || 'Erro ao remover método de pagamento');
        return;
      }

      toast.success('Método de pagamento removido com sucesso');
      setDeleteTarget(null);
      fetchPaymentMethods();
    } catch {
      toast.error('Erro ao remover método de pagamento');
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StLoading loading={loading}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <PageTitle title="Métodos de Pagamento" subtitle="Gerencie as formas de pagamento disponíveis" />
            <TopAddButton id="topAddButtonNewPaymentMethod" label="Novo Método" onClick={handleCreate} />
          </div>

          <div className="border rounded-lg">
            <StTable
              colunmNames={['Nome', 'Tipo', 'Status', 'Criado em', 'Ações']}
              items={paymentMethods.map((method) => ({
                name: method.name,
                type: method.paymentType,
                status: (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      method.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {method.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                ),
                createdAt: new Date(method.createdAt).toLocaleDateString('pt-BR'),
                actions: (
                  <div className="flex justify-end gap-2">
                    <Button variant="edit" size="sm" onClick={() => handleEdit(method)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(method)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
                id: method.id,
              }))}
            />
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--foreground))]">
                {dialogMode === 'create' ? 'Novo Método de Pagamento' : 'Editar Método de Pagamento'}
              </DialogTitle>
              <DialogDescription className="text-[hsl(var(--foreground-muted))]">
                {dialogMode === 'create'
                  ? 'Preencha os dados do novo método'
                  : 'Atualize os dados do método'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                htmlFor="name"
                label="Nome"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Pix Padrão"
                disabled={submitting}
              />

              <StSelect
                label="Tipo de Pagamento"
                htmlFor="paymentType"
                required
                value={formData.paymentType}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    paymentType: value as PaymentMethod['paymentType'],
                  })
                }
                items={paymentTypeOptions}
                loading={submitting}
                searchable={false}
              />

              <StCheckInput
                id="isActive"
                label="Ativo"
                checked={formData.isActive}
                onChange={(value) => setFormData({ ...formData, isActive: value })}
                disabled={submitting}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {dialogMode === 'create' ? 'Criar Método' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o método &quot;{deleteTarget?.name}&quot;? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </StLoading>
    </DashboardLayout>
  );
}
