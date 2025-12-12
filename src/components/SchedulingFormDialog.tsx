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
  meetingReasonId: string;
  meetingDate: string;
  status: 'Pendente' | 'Realizado' | 'Cancelado';
  observations?: string;
}

interface Client {
    id: string;
    name: string;
    email: string;
}

interface SchedulingFormDialogProps {
  open: boolean;
  onClose: () => void;
  scheduling: Scheduling | null;
  onSuccess: () => void;
  client: Client;
}

export function SchedulingFormDialog({
  open,
  onClose,
  scheduling,
  onSuccess,
  client,
}: SchedulingFormDialogProps) {
  const [meetingReasons, setMeetingReasons] = useState<MeetingReason[]>([]);
  const [userId, setUserId] = useState('');
  const [meetingReasonId, setMeetingReasonId] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [status, setStatus] = useState<'Pendente' | 'Realizado' | 'Cancelado'>('Pendente');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMeetingReasons();
      
      if (scheduling) {
        setUserId(scheduling.userId);
        setMeetingReasonId(scheduling.meetingReasonId);
        
        // Split date and time
        const date = new Date(scheduling.meetingDate);
        setMeetingDate(date.toISOString().split('T')[0]);
        setMeetingTime(date.toTimeString().slice(0, 5));
        
        setStatus(scheduling.status);
        setObservations(scheduling.observations || '');
      } else {
        reset();
      }
    }
  }, [open, scheduling]);

  const reset = () => {
    setUserId('');
    setMeetingReasonId('');
    setMeetingDate('');
    setMeetingTime('');
    setStatus('Pendente');
    setObservations('');
  };

  const fetchMeetingReasons = async () => {
    try {
      const response = await fetch('/api/meeting-reasons');
      if (response.ok) {
        const data = await response.json();
        setMeetingReasons(data);
      }
      setUserId(client.id);
    } catch (error) {
      console.error('Error fetching meeting reasons:', error);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !meetingReasonId || !meetingDate || !meetingTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const dateTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();

      const payload = {
        userId,
        meetingReasonId,
        meetingDate: dateTime,
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

      if (!response.ok) throw new Error('Erro ao salvar agendamento');

      toast.success(
        scheduling
          ? 'Agendamento atualizado com sucesso'
          : 'Agendamento criado com sucesso'
      );

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar agendamento');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {scheduling ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <StSelect 
                label='Cliente'
                required
                htmlFor='userId'
                items={[{
                    id: client.id,
                    description: `${client.name} (${client.email})`,
                }]}
                value={userId}
                onChange={(val) => setUserId(val as string)}
                loading={false}
                searchable={false}
            />
          </div>

          <div className="space-y-2">
            <StSelect
                label='Motivo da Reunião'
                required
                htmlFor='meetingReasonId'
                items={meetingReasons.map((reason) => ({
                    id: reason.id,
                    description: reason.name,
                }))}
                value={meetingReasonId}
                onChange={(val) => setMeetingReasonId(val as string)}
                loading={false}
                searchable={false}
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormField
                label='Data da Reunião'
                required
                value={meetingDate}
                onChangeValue={(e) => setMeetingDate(`${e}`)}
                date
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <StSelect 
                label='Status'
                htmlFor='status'
                items={[
                    { id: 'Pendente', description: 'Pendente' },
                    { id: 'Realizado', description: 'Realizado' },
                    { id: 'Cancelado', description: 'Cancelado' },
                ]}
                value={status}
                onChange={(val) => setStatus(val as 'Pendente' | 'Realizado' | 'Cancelado')}
                loading={false}
                searchable={false}
            />
          </div>

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
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
