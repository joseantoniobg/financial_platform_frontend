'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { StSelect } from './st-select';
import { FormField } from './ui/form-field';

interface User {
  id: string;
  name: string;
  email: string;
}

interface MeetingReason {
  id: string;
  name: string;
}

interface Scheduling {
  id: string;
  userId: string;
  clientId?: string;
  meetingReasonId: string;
  meetingDate: string;
  endDate: string;
  status: 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado' | 'Não Compareceu';
  observations?: string;
}

interface SchedulingFormDialogProps {
  open: boolean;
  onClose: () => void;
  scheduling: Scheduling | null;
  onSuccess: () => void;
}

export function SchedulingFormDialog({
  open,
  onClose,
  scheduling,
  onSuccess,
}: SchedulingFormDialogProps) {
  const { user } = useAuthStore();
  const [clients, setClients] = useState<User[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [meetingReasons, setMeetingReasons] = useState<MeetingReason[]>([]);
  const [userId, setUserId] = useState('');
  const [clientId, setClientId] = useState('');
  const [meetingReasonId, setMeetingReasonId] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<string>('Pendente');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = user?.roles.some(r => r.name === 'Administrador');
  const isConsultantOrAdmin = user?.roles.some(r => r.name === 'Consultor' || r.name === 'Administrador');

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchConsultants();
      fetchMeetingReasons();
      
      if (scheduling) {
        setUserId(scheduling.userId);
        setClientId(scheduling.clientId || 'None');
        setMeetingReasonId(scheduling.meetingReasonId);
        
        // Split date and time for start
        const startDate = new Date(scheduling.meetingDate);
        setMeetingDate(startDate.toISOString().split('T')[0]);
        setMeetingTime(startDate.toTimeString().slice(0, 5));
        
        // Split date and time for end
        const finishDate = new Date(scheduling.endDate);
        setEndDate(finishDate.toISOString().split('T')[0]);
        setEndTime(finishDate.toTimeString().slice(0, 5));
        
        setStatus(scheduling.status);
        setObservations(scheduling.observations || '');
      } else {
        reset();
      }
    }
  }, [open, scheduling]);

  const reset = () => {
    setUserId(user?.sub || '');
    setClientId('');
    setMeetingReasonId('');
    setMeetingDate('');
    setMeetingTime('');
    setEndDate('');
    setEndTime('');
    setStatus('Pendente');
    setObservations('');
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.users);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const filtered = data.users.filter((u: User & { roles?: Array<{ name: string }> }) => 
          u.roles?.some(r => r.name === 'Consultor' || r.name === 'Administrador')
        );
        setConsultants(filtered);
      }
    } catch (error) {
      console.error('Error fetching consultants:', error);
    }
  };

  const fetchMeetingReasons = async () => {
    try {
      const response = await fetch('/api/meeting-reasons');
      if (response.ok) {
        const data = await response.json();
        setMeetingReasons(data);
      }
    } catch (error) {
      console.error('Error fetching meeting reasons:', error);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !meetingReasonId || !meetingDate || !meetingTime || !endDate || !endTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const startDateTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast.error('Data de término deve ser posterior à data de início');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        userId,
        clientId: clientId !== 'None' ? clientId : undefined,
        meetingReasonId,
        meetingDate: startDateTime,
        endDate: endDateTime,
        status,
        observations: observations.trim() || undefined,
      };

      const url = scheduling
        ? `/api/schedulings/${scheduling.id}`
        : '/api/schedulings';

      const method = scheduling ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar agendamento');
      }

      toast.success(
        scheduling
          ? 'Agendamento atualizado com sucesso'
          : 'Agendamento criado com sucesso'
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar agendamento');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (newStatus: 'Confirmado' | 'Cancelado') => {
    if (!scheduling) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/schedulings/${scheduling.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scheduling,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar status');
      }

      toast.success(`Agendamento ${newStatus.toLowerCase()} com sucesso`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {scheduling ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isAdmin && <StSelect 
            label="Consultor/Administrador"
            required
            value={isConsultantOrAdmin ? user?.sub || '' : userId}
            onChange={setUserId}
            loading={!!scheduling}
            items={consultants.map(c => ({
              id: c.id,
              description: `${c.name} (${c.email})`
            }))}
            htmlFor='consultant-select'
          />}

          <StSelect
            label="Cliente"
            required={false}
            value={clientId}
            onChange={setClientId}
            loading={false}
            items={[{ id: 'None', description: 'Nenhum' }, ...clients.map(c => ({
              id: c.id,
              description: `${c.name} (${c.email})`
            }))]}
            htmlFor='client-select'
          />

          <StSelect
            label="Motivo da Reunião"
            required
            value={meetingReasonId}
            onChange={setMeetingReasonId}
            loading={false}
            items={meetingReasons.map(r => ({
              id: r.id,
              description: r.name
            }))}
            htmlFor='reason-select'
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label='Data de Início'
              htmlFor='date'
              date
              value={meetingDate}
              onChangeValue={(v) => setMeetingDate(`${v}`)}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="time">Horário de Início *</Label>
              <Input
                id="time"
                type="time"
                
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label='Data de Término'
              htmlFor='end-date'
              date
              value={endDate}
              onChangeValue={(v) => setEndDate(`${v}`)}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Término *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <StSelect
            label="Status"
            required
            value={status}
            onChange={setStatus}
            loading={false}
            items={[
              { id: 'Pendente', description: 'Pendente' },
              { id: 'Confirmado', description: 'Confirmado' },
              { id: 'Realizado', description: 'Realizado' },
              { id: 'Cancelado', description: 'Cancelado' },
              { id: 'Não Compareceu', description: 'Não Compareceu' },
            ]}
            htmlFor='status-select'
          />
          
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações adicionais sobre o agendamento"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {scheduling && scheduling.status !== 'Confirmado' && scheduling.status !== 'Cancelado' && (
            <div className="flex gap-2 w-full sm:w-auto sm:mr-auto">
              <Button
                type="button"
                variant="default"
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                onClick={() => handleQuickStatusUpdate('Confirmado')}
                disabled={isSubmitting}
              >
                Confirmar
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1 sm:flex-none"
                onClick={() => handleQuickStatusUpdate('Cancelado')}
                disabled={isSubmitting}
              >
                Cancelar Reunião
              </Button>
            </div>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 sm:flex-none">
              Fechar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 sm:flex-none">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
