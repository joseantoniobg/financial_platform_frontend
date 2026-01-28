'use client';

import { useState, useEffect, useMemo } from 'react';
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
  defaultClientId?: string;
}

export function SchedulingFormDialog({
  open,
  onClose,
  scheduling,
  onSuccess,
  defaultClientId,
}: SchedulingFormDialogProps) {
  const { user } = useAuthStore();
  const [clients, setClients] = useState<User[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [meetingReasons, setMeetingReasons] = useState<MeetingReason[]>([]);
  const [userId, setUserId] = useState('');
  const [clientId, setClientId] = useState('');
  const [meetingReasonId, setMeetingReasonId] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endDate, setEndDate] = useState('');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [status, setStatus] = useState<string>('Pendente');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = user?.roles.some(r => r.name === 'Administrador');
  const isConsultantOrAdmin = user?.roles.some(r => r.name === 'Consultor' || r.name === 'Administrador');
  const [query, setQuery] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);

  // Generate hours (00-23) and minutes (00, 15, 30, 45)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

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
        setStartHour(startDate.getHours().toString().padStart(2, '0'));
        setStartMinute(startDate.getMinutes().toString().padStart(2, '0'));
        
        // Split date and time for end
        const finishDate = new Date(scheduling.endDate);
        setEndDate(finishDate.toISOString().split('T')[0]);
        setEndHour(finishDate.getHours().toString().padStart(2, '0'));
        setEndMinute(finishDate.getMinutes().toString().padStart(2, '0'));
        
        setStatus(scheduling.status);
        setObservations(scheduling.observations || '');
      } else {
        reset();
      }
    }
  }, [open, scheduling, defaultClientId]);

  const fetchClients = useMemo(() => async () => {
    try {
      setLoadingClients(true);
      const response = await fetch(`/api/clients?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.users);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  }, [query]);

  useEffect(() => {
    fetchClients();
  }, [query]);

  const reset = () => {
    setUserId(user?.sub || '');
    setClientId(defaultClientId || '');
    setMeetingReasonId('');
    setMeetingDate('');
    setStartHour('09');
    setStartMinute('00');
    setEndDate('');
    setEndHour('10');
    setEndMinute('00');
    setStatus('Pendente');
    setObservations('');
  };

  // Automatically set end time to 1 hour after start time
  const handleStartTimeChange = (hour?: string, minute?: string) => {
    const newHour = hour || startHour;
    const newMinute = minute || startMinute;
    
    if (hour !== undefined) setStartHour(hour);
    if (minute !== undefined) setStartMinute(minute);

    // Calculate end time (1 hour later)
    const startTotalMinutes = parseInt(newHour) * 60 + parseInt(newMinute);
    const endTotalMinutes = startTotalMinutes + 60;
    
    const calculatedEndHour = Math.floor(endTotalMinutes / 60) % 24;
    const calculatedEndMinute = endTotalMinutes % 60;
    
    setEndHour(calculatedEndHour.toString().padStart(2, '0'));
    setEndMinute(calculatedEndMinute.toString().padStart(2, '0'));
    
    // If end time goes to next day, update end date
    if (meetingDate && endTotalMinutes >= 24 * 60) {
      const startDate = new Date(meetingDate);
      startDate.setDate(startDate.getDate() + 1);
      setEndDate(startDate.toISOString().split('T')[0]);
    } else if (meetingDate && !endDate) {
      setEndDate(meetingDate);
    }
  };

  // Update end date when start date changes
  const handleStartDateChange = (date: string) => {
    setMeetingDate(date);
    if (!endDate) {
      setEndDate(date);
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
    if (!userId || !meetingReasonId || !meetingDate || !startHour || !startMinute || !endDate || !endHour || !endMinute) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const startDateTime = new Date(`${meetingDate}T${startHour}:${startMinute}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endHour}:${endMinute}`).toISOString();

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
            query={query}
            setQuery={setQuery}
            loading={loadingClients}
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
            searchable={false}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label='Data de Início'
              htmlFor='date'
              date
              value={meetingDate}
              onChangeValue={(v) => handleStartDateChange(`${v}`)}
              required
            />
            <div className="space-y-2">
              <Label>Horário de Início</Label>
              <div className="flex gap-2">
                <StSelect 
                  label=""
                  value={startHour}
                  onChange={(v) => handleStartTimeChange(v, undefined)}
                  loading={false}
                  searchable={false}
                  items={hours.map(h => ({ id: h, description: `${h}h` }))}
                  htmlFor='start-hour-select'
                />
                <StSelect 
                  label=""
                  value={startMinute}
                  onChange={(v) => handleStartTimeChange(undefined, v)}
                  loading={false}
                  searchable={false}
                  items={minutes.map(m => ({ id: m, description: `${m}m` }))}
                  htmlFor='start-minute-select'
                />
              </div>
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
              <Label>Horário de Término</Label>
              <div className="flex gap-2">
                <StSelect 
                  label=""
                  value={endHour}
                  onChange={setEndHour}
                  loading={false}
                  searchable={false}
                  items={hours.map(h => ({ id: h, description: `${h}h` }))}
                  htmlFor='start-hour-select'
                />
                <StSelect 
                  label=""
                  value={endMinute}
                  onChange={setEndMinute}
                  loading={false}
                  searchable={false}
                  items={minutes.map(m => ({ id: m, description: `${m}m` }))}
                  htmlFor='start-minute-select'
                />
              </div>
            </div>
          </div>

          <StSelect
            label="Status"
            required
            value={status}
            onChange={setStatus}
            loading={false}
            searchable={false}
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
