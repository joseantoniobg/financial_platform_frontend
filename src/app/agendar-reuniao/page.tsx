"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, User, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StSelect } from "@/components/st-select";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailableSlotsResponse {
  consultantId: string;
  consultantName: string;
  date: string;
  slots: TimeSlot[];
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
  user?: {
    id: string;
    name: string;
  };
  meetingReason?: {
    id: string;
    name: string;
  };
}

export default function ClientSchedulingPage() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsResponse | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [meetingReasons, setMeetingReasons] = useState<MeetingReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [observations, setObservations] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upcomingSchedulings, setUpcomingSchedulings] = useState<Scheduling[]>([]);
  const [isLoadingSchedulings, setIsLoadingSchedulings] = useState(false);

  useEffect(() => {
    fetchMeetingReasons();
    if (user) {
      fetchUpcomingSchedulings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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

  const fetchAvailableSlots = async () => {
    setIsLoading(true);
    setSelectedSlot(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/schedulings/available-slots?date=${dateStr}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar horários disponíveis');
      }
      
      const data = await response.json();
      setAvailableSlots(data);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Erro ao carregar horários disponíveis');
      setAvailableSlots(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingSchedulings = async () => {
    if (!user) return;

    setIsLoadingSchedulings(true);
    try {
      const response = await fetch(`/api/schedulings/client/${user.sub}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedulings');
      }
      
      const data = await response.json();
      
      // Filter only future schedulings and sort by date
      const now = new Date();
      const futureSchedulings = data
        .filter((s: Scheduling) => new Date(s.meetingDate) >= now)
        .sort((a: Scheduling, b: Scheduling) => 
          new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()
        );
      
      setUpcomingSchedulings(futureSchedulings);
    } catch (error) {
      console.error('Error fetching schedulings:', error);
      toast.error('Erro ao buscar seus agendamentos');
    } finally {
      setIsLoadingSchedulings(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedSlot || !selectedReason) {
      toast.error('Selecione um horário e motivo da reunião');
      return;
    }

    if (!availableSlots) {
      toast.error('Dados de agendamento não disponíveis');
      return;
    }

    setIsSubmitting(true);
    try {
      const [hours, minutes] = selectedSlot.split(':');
      const meetingDate = new Date(selectedDate);
      meetingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDate = new Date(meetingDate);
      endDate.setHours(meetingDate.getHours() + 1);

      const response = await fetch('/api/schedulings/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingReasonId: selectedReason,
          meetingDate: meetingDate.toISOString(),
          endDate: endDate.toISOString(),
          observations: observations.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar agendamento');
      }

      toast.success('Agendamento solicitado com sucesso! Aguarde a confirmação do seu consultor.');
      
      // Reset form and refresh data
      setSelectedSlot(null);
      setSelectedReason('');
      setObservations('');
      fetchAvailableSlots();
      fetchUpcomingSchedulings();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Erro ao agendar reunião');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isClient = user?.roles.some(role => role.name === 'Cliente');

  if (!isClient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return 'default';
      case 'Pendente':
        return 'secondary';
      case 'Realizado':
        return 'outline';
      case 'Cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Seus Agendamentos</h1>
          <p className="text-muted-foreground mt-2">
            Escolha uma data e horário disponível para reunião com seu consultor
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Selecione a Data
              </CardTitle>
              <CardDescription>
                Escolha uma data para ver os horários disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Available Slots */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários Disponíveis
              </CardTitle>
              {availableSlots && (
                <CardDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Consultor: {availableSlots.consultantName}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando horários...
                </div>
              ) : !availableSlots ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Você não tem um consultor atribuído. Entre em contato com o administrador.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block">
                      Horários para {new Date(selectedDate).toLocaleDateString('pt-BR')}
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableSlots.slots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedSlot === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className="w-full"
                        >
                          {slot.time}
                          {!slot.available && (
                            <span className="ml-2 text-xs">(Ocupado)</span>
                          )}
                        </Button>
                      ))}
                    </div>
                    {availableSlots.slots.every(slot => !slot.available) && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Não há horários disponíveis nesta data. Tente outra data.
                      </p>
                    )}
                  </div>

                  {selectedSlot && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <p className="font-medium">Horário Selecionado:</p>
                        <p className="text-lg font-bold text-primary">
                          {selectedSlot} - {parseInt(selectedSlot.split(':')[0]) + 1}:00
                        </p>
                        <p className="text-sm text-muted-foreground">Duração: 1 hora</p>
                      </div>

                      <StSelect
                        label="Motivo da Reunião"
                        required
                        value={selectedReason}
                        onChange={setSelectedReason}
                        loading={false}
                        searchable={false}
                        items={meetingReasons.map(r => ({
                          id: r.id,
                          description: r.name
                        }))}
                        htmlFor='reason-select'
                      />

                      <div className="space-y-2">
                        <Label htmlFor="observations">Observações (Opcional)</Label>
                        <Textarea
                          id="observations"
                          value={observations}
                          onChange={(e) => setObservations(e.target.value)}
                          placeholder="Adicione detalhes sobre o assunto da reunião..."
                          rows={3}
                        />
                      </div>

                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Importante:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Sua solicitação será enviada com status &quot;Pendente&quot;</li>
                              <li>Aguarde a confirmação do seu consultor</li>
                              <li>Você receberá um e-mail de confirmação</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleSchedule}
                        disabled={isSubmitting || !selectedReason}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? 'Agendando...' : 'Solicitar Agendamento'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

         {upcomingSchedulings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Suas Próximas Reuniões
              </CardTitle>
              <CardDescription>
                Reuniões agendadas com seu consultor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSchedulings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Carregando agendamentos...</div>
                </div>
              ) : (
              <div className="space-y-3">
                {upcomingSchedulings.map((scheduling) => {
                  const startDateTime = formatDateTime(scheduling.meetingDate);
                  const endDateTime = formatDateTime(scheduling.endDate);
                  
                  return (
                    <div
                      key={scheduling.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(scheduling.status)}>
                            {scheduling.status}
                          </Badge>
                          <span className="font-medium text-sm">
                            {scheduling.meetingReason?.name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{startDateTime.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4" />
                            <span>{startDateTime.time} - {endDateTime.time}</span>
                          </div>
                          {scheduling.user && (
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-4 w-4" />
                              <span>Consultor: {scheduling.user.name}</span>
                            </div>
                          )}
                        </div>
                        {scheduling.observations && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {scheduling.observations}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
