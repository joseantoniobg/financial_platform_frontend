'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  service: string;
}

interface Client {
  id: string;
  name: string;
  login: string;
  email: string;
}

interface Assignment {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  scheduledDate: string;
}

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSuccess: () => void;
}

export function AssignDialog({ open, onOpenChange, service, onSuccess }: AssignDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
  });

  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      const res = await fetch(`/api/users/clients?search=${searchClient}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Clients loaded:', data);
        setClients(data.data || []);
      } else {
        const errorData = await res.json();
        console.error('Error loading clients:', errorData);
        toast.error(errorData.message || 'Erro ao carregar clientes');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoadingClients(false);
    }
  }, [searchClient]);

  const fetchAssignments = useCallback(async () => {
    if (!service) return;

    try {
      setLoadingAssignments(true);
      // Get all assignments and filter by service
      const res = await fetch(`/api/services/assign?page=1&limit=100`);
      if (res.ok) {
  const data = await res.json();
  // Filter assignments for this specific service
  type AssignmentShape = { serviceId?: string } & Record<string, unknown>;
  const allAssignments = Array.isArray(data.data) ? (data.data as AssignmentShape[]) : [];
        const serviceAssignments = allAssignments.filter((a) => a.serviceId === service.id);
        const normalized: Assignment[] = serviceAssignments.map((a) => {
          const aa = a as unknown as Record<string, unknown>;
          const userObj = (aa['user'] as Record<string, unknown> | undefined) ?? {};
          return {
            id: String(aa['id'] ?? ''),
            user: {
              id: String(userObj['id'] ?? ''),
              name: String(userObj['name'] ?? ''),
              email: String(userObj['email'] ?? ''),
            },
            scheduledDate: String(aa['scheduledDate'] ?? ''),
          } as Assignment;
        });
        setAssignments(normalized);
      }
    } catch {
      toast.error('Erro ao carregar atribuições');
    } finally {
      setLoadingAssignments(false);
    }
  }, [service]);

  // Load clients and assignments when dialog opens
  useEffect(() => {
    if (open && service) {
      fetchClients();
      fetchAssignments();
    }
  }, [open, service, fetchClients, fetchAssignments]);

  // Reload clients when search changes
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchClient, open, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (!formData.scheduledDate) {
      toast.error('Informe a data agendada');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        userId: formData.clientId,
        serviceId: service!.id,
        scheduledDate: formData.scheduledDate,
      };

      const res = await fetch('/api/services/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Serviço atribuído com sucesso!');
        setFormData({
          clientId: '',
          scheduledDate: new Date().toISOString().split('T')[0],
        });
        setShowForm(false);
        fetchAssignments();
        onSuccess();
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
        onSuccess();
      } else {
        toast.error('Erro ao remover atribuição');
      }
    } catch {
      toast.error('Erro ao remover atribuição');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-[#0D2744] border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white">
            Atribuir Serviço - {service?.service}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-400">
            Atribua este serviço a clientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Assignment Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#B4F481] text-[#0A1929] rounded-lg hover:bg-[#9FD96F] transition-colors font-medium"
            >
              <UserCheck className="h-5 w-5" />
              Nova Atribuição
            </button>
          )}

          {/* Assignment Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0A1929]">
              <h3 className="font-medium text-slate-800 dark:text-white">Nova Atribuição</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-slate-700 dark:text-gray-300">
                    Cliente <span className="text-red-500">*</span>
                  </Label>
                  
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar cliente..."
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                      className="pl-10 bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                    />
                  </div>

                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    disabled={submitting || loadingClients}
                  >
                    <SelectTrigger className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
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

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate" className="text-slate-700 dark:text-gray-300">
                    Data Agendada <span className="text-red-500">*</span>
                  </Label>
                  <DateInput
                    id="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={(value) => setFormData({ ...formData, scheduledDate: value })}
                    className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      clientId: '',
                      scheduledDate: new Date().toISOString().split('T')[0],
                    });
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Atribuir Serviço
                </button>
              </div>
            </form>
          )}

          {/* Current Assignments */}
          <div className="space-y-2">
            <h3 className="font-medium text-slate-800 dark:text-white">Clientes com este Serviço</h3>
            
            {loadingAssignments ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#B4F481]" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg">
                Nenhum cliente com este serviço
              </div>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-lg border bg-white dark:bg-[#0A1929] border-gray-200 dark:border-gray-600 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white">
                        {assignment.user.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {assignment.user.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Agendado: {new Date(assignment.scheduledDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remover atribuição"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
