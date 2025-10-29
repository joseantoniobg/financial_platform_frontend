'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useRequireAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  service: string;
  isActive: boolean;
}

interface ServiceAssignment {
  id: string;
  service: {
    id: string;
    service: string;
  };
  startDate: string;
  endDate?: string;
  paymentDay: number;
  isActive: boolean;
  createdAt: string;
}

export default function ClientAssignmentsPage() {
  useRequireAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchClient, setSearchClient] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    serviceId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentDay: 10,
  });

  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      const res = await fetch(`/api/users/clients?search=${searchClient}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.data || []);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Erro ao carregar clientes');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoadingClients(false);
    }
  }, [searchClient]);

  const fetchServices = useCallback(async () => {
    try {
      setLoadingServices(true);
      const res = await fetch('/api/services?page=1&limit=100');
      if (res.ok) {
        const data = await res.json();
        setServices(data.data.filter((s: Service) => s.isActive));
      }
    } catch {
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoadingServices(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    if (!selectedClient) {
      setAssignments([]);
      return;
    }

    try {
      setLoadingAssignments(true);
      const res = await fetch(`/api/services/assign/client/${selectedClient}`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.data || []);
      }
    } catch {
      toast.error('Erro ao carregar atribuições');
    } finally {
      setLoadingAssignments(false);
    }
  }, [selectedClient]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchClient, fetchClients]);

  const handleOpenDialog = () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente primeiro');
      return;
    }
    setFormData({
      serviceId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      paymentDay: 10,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceId) {
      toast.error('Selecione um serviço');
      return;
    }

    if (!formData.startDate) {
      toast.error('Informe a data de início');
      return;
    }

    if (formData.paymentDay < 1 || formData.paymentDay > 31) {
      toast.error('Dia de pagamento deve ser entre 1 e 31');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        userId: selectedClient,
        serviceId: formData.serviceId,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        paymentDay: formData.paymentDay,
      };

      const res = await fetch('/api/services/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Serviço atribuído com sucesso!');
        setDialogOpen(false);
        fetchAssignments();
      } else {
        toast.error(data.message || 'Erro ao atribuir serviço');
      }
    } catch {
      toast.error('Erro ao atribuir serviço');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Deseja realmente remover esta atribuição?')) {
      return;
    }

    try {
      const res = await fetch(`/api/services/assign/${assignmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Atribuição removida com sucesso!');
        fetchAssignments();
      } else {
        toast.error('Erro ao remover atribuição');
      }
    } catch {
      toast.error('Erro ao remover atribuição');
    }
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <DashboardLayout userName="Administrador">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Atribuição de Serviços
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-2">
            Gerencie os serviços atribuídos aos clientes
          </p>
        </div>

        {/* Client Selection */}
        <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Selecionar Cliente
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cliente..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="pl-10 bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
              />
            </div>

            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                {loadingClients ? (
                  <div className="p-2 text-center text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  </div>
                ) : clients.length === 0 ? (
                  <div className="p-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Nenhum cliente encontrado
                  </div>
                ) : (
                  clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id}
                      className="text-slate-800 dark:text-white"
                    >
                      {client.name} ({client.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assignments List */}
        {selectedClient && (
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Serviços de {selectedClientData?.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {assignments.length} serviço{assignments.length !== 1 ? 's' : ''} ativo{assignments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleOpenDialog}
                className="flex items-center gap-2 px-4 py-2 bg-[#B4F481] text-[#0A1929] rounded-lg hover:bg-[#9FD96F] transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                Atribuir Serviço
              </button>
            </div>

            {loadingAssignments ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#B4F481]" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center p-12 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum serviço atribuído</p>
                <p className="text-sm mt-1">Clique em &quot;Atribuir Serviço&quot; para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-lg border bg-gray-50 dark:bg-[#0A1929] border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {assignment.service.service}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Início: {formatDate(assignment.startDate)}
                              {assignment.endDate && ` - Fim: ${formatDate(assignment.endDate)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              Dia de pagamento: todo dia {assignment.paymentDay}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remover atribuição"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#0D2744] border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-slate-800 dark:text-white">
                  Atribuir Serviço
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-gray-400">
                  Atribua um novo serviço para {selectedClientData?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceId" className="text-slate-700 dark:text-gray-300">
                    Serviço <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                    disabled={submitting || loadingServices}
                  >
                    <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                      {loadingServices ? (
                        <div className="p-2 text-center text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin inline" />
                        </div>
                      ) : services.length === 0 ? (
                        <div className="p-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                          Nenhum serviço ativo encontrado
                        </div>
                      ) : (
                        services.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={service.id}
                            className="text-slate-800 dark:text-white"
                          >
                            {service.service}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-slate-700 dark:text-gray-300">
                      Data de Início <span className="text-red-500">*</span>
                    </Label>
                    <DateInput
                      id="startDate"
                      value={formData.startDate}
                      onChange={(value) => setFormData({ ...formData, startDate: value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-slate-700 dark:text-gray-300">
                      Data de Fim <span className="text-xs text-gray-500">(opcional)</span>
                    </Label>
                    <DateInput
                      id="endDate"
                      value={formData.endDate}
                      onChange={(value) => setFormData({ ...formData, endDate: value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDay" className="text-slate-700 dark:text-gray-300">
                    Dia de Pagamento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paymentDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDay}
                    onChange={(e) => setFormData({ ...formData, paymentDay: parseInt(e.target.value) || 1 })}
                    className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                    disabled={submitting}
                    placeholder="Ex: 10"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Dia do mês em que o pagamento deve ser realizado (1-31)
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Deixe a data de fim em branco para uma atribuição sem data de término definida.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Atribuir Serviço
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
