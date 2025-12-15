'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Scheduling } from '@/models/scheduling.model';

interface MonthViewProps {
  schedulings: Scheduling[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

export default function MonthView({ schedulings, currentDate, onDateChange, onDayClick }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const previousMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const getSchedulingsForDay = (day: number) => {
    const dayDate = new Date(year, month, day);
    const startOfDay = new Date(dayDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dayDate.setHours(23, 59, 59, 999));

    return schedulings.filter((s) => {
      const scheduleStart = new Date(s.meetingDate);
      const scheduleEnd = new Date(s.endDate);
      return (
        (scheduleStart >= startOfDay && scheduleStart <= endOfDay) ||
        (scheduleEnd >= startOfDay && scheduleEnd <= endOfDay) ||
        (scheduleStart <= startOfDay && scheduleEnd >= endOfDay)
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-500';
      case 'Confirmado':
        return 'bg-blue-500';
      case 'Realizado':
        return 'bg-green-500';
      case 'Cancelado':
        return 'bg-red-500';
      case 'Não Compareceu':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-24 p-2 border border-border bg-muted/30" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const daySchedulings = getSchedulingsForDay(day);
    const isToday = 
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    days.push(
      <div
        key={day}
        onClick={() => onDayClick?.(new Date(year, month, day))}
        className={`min-h-24 p-2 border border-border hover:bg-accent/50 cursor-pointer transition-colors ${
          isToday ? 'bg-primary/10 border-primary' : 'bg-card'
        }`}
      >
        <div className={`font-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
          {day}
        </div>
        <div className="space-y-1">
          {daySchedulings.slice(0, 3).map((scheduling) => (
            <div
              key={scheduling.id}
              className={`text-xs p-1 rounded truncate ${getStatusColor(scheduling.status)} text-white`}
              title={`${scheduling.meetingReason?.name}${scheduling.client ? ` - ${scheduling.client.name}` : ''}`}
            >
              {new Date(scheduling.meetingDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              {scheduling.meetingReason?.name}
            </div>
          ))}
          {daySchedulings.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{daySchedulings.length - 3} mais
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
          >
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {dayNames.map((name) => (
            <div key={name} className="p-2 text-center font-semibold border-r border-border last:border-r-0">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    </div>
  );
}
