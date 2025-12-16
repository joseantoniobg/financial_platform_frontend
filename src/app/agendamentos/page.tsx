"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import { SchedulingFormDialog } from "@/components/SchedulingFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Scheduling } from "@/models/scheduling.model";
import { DashboardLayout } from "@/components/DashboardLayout";

interface User {
  id: string;
  name: string;
  roles: { name: string }[];
}

type ViewMode = 'month' | 'week' | 'day';

function getMonthRange(date: Date): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function getWeekRange(date: Date): { start: string; end: string } {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day; // Start from Sunday
  
  const start = new Date(current);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function getDayRange(date: Date): { start: string; end: string } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export default function AgendamentosPage() {
  const { user } = useAuthStore();
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScheduling, setSelectedScheduling] = useState<Scheduling | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [schedulingToDelete, setSchedulingToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.roles.some(role => role.name === 'Administrador');
  const isConsultor = user?.roles.some(role => role.name === 'Consultor');

  // Fetch consultants (for admin filter)
  useEffect(() => {
    if (isAdmin) {
      fetchConsultants();
    } else if (isConsultor && user) {
      setSelectedConsultant(user.sub);
    }
  }, [isAdmin, isConsultor, user]);

  // Fetch schedulings when consultant, date, or view changes
  useEffect(() => {
    if (selectedConsultant || !isDialogOpen) {
      fetchSchedulings();
    }
  }, [selectedConsultant, currentDate, viewMode, isDialogOpen]);

  const fetchConsultants = async () => {
    try {
        if (!isAdmin) {
            return;
        }

      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Erro ao buscar consultores');
      
      const data = await response.json();
      console.log('Consultants fetched:', data);
      const consultantUsers = data.users.filter((u: User) => 
        u.roles.some((role: { name: string }) => role.name === 'Consultor' || role.name === 'Administrador')
      );

      setConsultants(consultantUsers);
      
      // Select current user by default if admin
      if (user && consultantUsers.some((c: User) => c.id === user.sub)) {
        setSelectedConsultant(user.sub);
      } else if (consultantUsers.length > 0) {
        setSelectedConsultant(consultantUsers[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar consultores:', error);
      toast.error('Erro ao carregar lista de consultores');
    }
  };

  const fetchSchedulings = async () => {
    if (!selectedConsultant) return;
    
    setIsLoading(true);
    try {
      let range: { start: string; end: string };
      
      switch (viewMode) {
        case 'month':
          range = getMonthRange(currentDate);
          break;
        case 'week':
          range = getWeekRange(currentDate);
          break;
        case 'day':
          range = getDayRange(currentDate);
          break;
      }
      
      const url = `/api/schedulings/user/${selectedConsultant}?startDate=${range.start}&endDate=${range.end}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Erro ao buscar agendamentos');
      
      const data = await response.json();
      setSchedulings(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScheduling = () => {
    setSelectedScheduling(null);
    setIsDialogOpen(true);
  };

  const handleEditScheduling = (scheduling: Scheduling) => {
    setSelectedScheduling(scheduling);
    setIsDialogOpen(true);
  };

  const handleDeleteScheduling = (id: string) => {
    setSchedulingToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!schedulingToDelete) return;
    
    try {
      const response = await fetch(`/api/schedulings/${schedulingToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir agendamento');
      
      toast.success('Agendamento excluído com sucesso');
      fetchSchedulings();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    } finally {
      setIsDeleteDialogOpen(false);
      setSchedulingToDelete(null);
    }
  };

  const handleSaveScheduling = () => {
    setIsDialogOpen(false);
    setSelectedScheduling(null);
    fetchSchedulings();
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const handleTimeClick = (date: Date) => {
    setCurrentDate(date);
    // Could open create dialog with pre-filled date/time
    setIsDialogOpen(true);
  };

  const handleSchedulingClick = (scheduling: Scheduling) => {
    handleEditScheduling(scheduling);
  };

  const handleStatusChange = async (schedulingId: string, newStatus: 'Confirmado' | 'Cancelado') => {
    try {
      const scheduling = schedulings.find(s => s.id === schedulingId);
      if (!scheduling) return;

      const response = await fetch(`/api/schedulings/${schedulingId}`, {
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
      fetchSchedulings();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAdmin && !isConsultor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <Button onClick={handleCreateScheduling}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filters and View Selector */}
      <Card className="p-4 my-3">
        <div className="flex items-center justify-between gap-4">
          {/* Consultant Filter (Admin only) */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Consultor:</label>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Selecione um consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (<div></div>)}

          {/* View Mode Selector */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="day">Dia</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Calendar Views */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      ) : (
        <>
          {viewMode === 'month' && (
            <MonthView
              schedulings={schedulings}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onDayClick={handleDayClick}
            />
          )}

          {viewMode === 'week' && (
            <WeekView
              schedulings={schedulings}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onTimeClick={handleTimeClick}
              onSchedulingClick={handleSchedulingClick}
              onStatusChange={handleStatusChange}
            />
          )}

          {viewMode === 'day' && (
            <DayView
              schedulings={schedulings}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onTimeClick={handleTimeClick}
              onSchedulingClick={handleSchedulingClick}
              onStatusChange={handleStatusChange}
            />
          )}
        </>
      )}

      {/* Scheduling Form Dialog */}
      <SchedulingFormDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedScheduling(null);
        }}
        scheduling={selectedScheduling}
        onSuccess={() => {}}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
