'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Plus, Edit, Power, DollarSign, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { PricingDialog } from '@/components/PricingDialog';
import { AssignDialog } from '@/components/AssignDialog';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { TopAddButton } from '@/components/ui/top-add-button';
import { StLoading } from '@/components/StLoading';
import { FormField } from '@/components/ui/form-field';

interface Service {
  id: string;
  service: string;
  isActive: boolean;
  createdAt: string;
}

export default function ServicesPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ service: '' });
  const [submitting, setSubmitting] = useState(false);

  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/services?page=${page}&limit=10&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.data);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated, fetchServices]);

  const handleCreate = () => {
    setDialogMode('create');
    setCurrentService(null);
    setFormData({ service: '' });
    setDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setDialogMode('edit');
    setCurrentService(service);
    setFormData({ service: service.service });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service || formData.service.length < 3) {
      toast.error('Nome do serviço deve ter pelo menos 3 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const url = dialogMode === 'create' ? '/api/services' : `/api/services/${currentService?.id}`;
      const method = dialogMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(dialogMode === 'create' ? 'Serviço criado com sucesso!' : 'Serviço atualizado com sucesso!');
        setDialogOpen(false);
        fetchServices();
      } else {
        toast.error(data.message || 'Erro ao salvar serviço');
      }
    } catch (error) {
      toast.error('Erro ao salvar serviço');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const res = await fetch(`/api/services/${service.id}/toggle-status`, {
        method: 'PATCH',
      });

      if (res.ok) {
        toast.success(`Serviço ${service.isActive ? 'inativado' : 'ativado'} com sucesso!`);
        fetchServices();
      } else {
        toast.error('Erro ao alterar status do serviço');
      }
    } catch (error) {
      toast.error('Erro ao alterar status do serviço');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <StLoading loading={loading}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <PageTitle title='Serviços' subtitle='Gerencie os serviços, precificação e atribuições' />
            <TopAddButton id="topAddButtonNewService" label='Novo Serviço' onClick={handleCreate} />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--foreground))]" />
            <Input
              placeholder="Buscar serviços..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Services Table */}
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[]" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center p-8 text-[hsl(var(--foreground))]">
                Nenhum serviço encontrado
              </div>
            ) : (
              <div className="overflow-x-auto border border-[hsl(var(--app-border))] overflow-hidden rounded-lg">
                <table className="w-full">
                  <thead className="bg-[hsl(var(--card-accent))] border-b border-[hsl(var(--app-border))]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))]">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-[hsl(var(--card-accent))] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[hsl(var(--foreground))]">
                          {service.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            service.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {service.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[hsl(var(--foreground))]">
                          {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentService(service);
                                setPricingDialogOpen(true);
                              }}
                              className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Gerenciar Preços"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentService(service);
                                setAssignDialogOpen(true);
                              }}
                              className="p-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Atribuir a Cliente"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(service)}
                              className={`p-2 ${
                                service.isActive
                                  ? 'text-red-600 hover:text-red-800 dark:text-red-400'
                                  : 'text-green-600 hover:text-green-800 dark:text-green-400'
                              }`}
                              title={service.isActive ? 'Inativar' : 'Ativar'}
                            >
                              <Power className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg ${
                    page === pageNum
                      ? 'bg-[hsl(var(--green))] text-[hsl(var(--foreground-dark))]'
                      : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card-accent))] dark:text-white dark:hover:bg-[hsl(var(--card-hover))]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--foreground))]">
                {dialogMode === 'create' ? 'Novo Serviço' : 'Editar Serviço'}
              </DialogTitle>
              <DialogDescription className="text-[hsl(var(--foreground-muted))]">
                {dialogMode === 'create'
                  ? 'Preencha os dados do novo serviço'
                  : 'Atualize os dados do serviço'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                htmlFor="service"
                label="Nome do Serviço"
                value={formData.service}
                onChange={(e) => setFormData({ service: e.target.value })}
                placeholder="Ex: Consultoria Financeira"
                disabled={submitting}
                required
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {dialogMode === 'create' ? 'Criar Serviço' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pricing Dialog */}
        <PricingDialog
          open={pricingDialogOpen}
          onOpenChange={setPricingDialogOpen}
          service={currentService}
          onSuccess={fetchServices}
        />

        {/* Assign Dialog */}
        <AssignDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          service={currentService}
          onSuccess={fetchServices}
        />
      </StLoading>
    </DashboardLayout>
  );
}
