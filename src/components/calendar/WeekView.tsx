"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SchedulingStatus = 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado' | 'Não Compareceu';

interface Scheduling {
  id: string;
  userId: string;
  clientId?: string;
  meetingReasonId: string;
  meetingDate: string;
  endDate: string;
  status: SchedulingStatus;
  observations?: string;
  user?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
  meetingReason?: {
    id: string;
    name: string;
  };
}

interface WeekViewProps {
  schedulings: Scheduling[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSchedulingClick: (scheduling: Scheduling) => void;
  onTimeClick?: (date: Date, hour: number) => void;
  onStatusChange?: (schedulingId: string, newStatus: 'Confirmado' | 'Cancelado') => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getWeekDates(date: Date): Date[] {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day; // Start from Sunday
  
  const weekStart = new Date(current);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function getStatusColor(status: SchedulingStatus): string {
  const colors = {
    'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Confirmado': 'bg-blue-100 text-blue-800 border-blue-300',
    'Realizado': 'bg-green-100 text-green-800 border-green-300',
    'Cancelado': 'bg-red-100 text-red-800 border-red-300',
    'Não Compareceu': 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

function getSchedulingsForDay(schedulings: Scheduling[], date: Date ): Scheduling[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  
  return schedulings.filter(scheduling => {
    const meetingStart = new Date(scheduling.meetingDate);
    const meetingEnd = new Date(scheduling.endDate);
    
    return (
      (meetingStart >= dayStart && meetingStart <= dayEnd) ||
      (meetingEnd >= dayStart && meetingEnd <= dayEnd) ||
      (meetingStart < dayStart && meetingEnd > dayEnd)
    );
  });
}

function getTimePosition(date: Date): { top: number; height: number } {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (hours < 8 || hours >= 21) {
    return { top: 0, height: 0 }; // Outside visible range
  }
  
  const topHour = hours - 8;
  const topMinutes = minutes / 60;
  const top = (topHour + topMinutes) * 60; // 60px per hour
  
  return { top, height: 0 };
}

function getMeetingPosition(scheduling: Scheduling): { top: number; height: number } {
  const startDate = new Date(scheduling.meetingDate);
  const endDate = new Date(scheduling.endDate);
  
  const startPos = getTimePosition(startDate);
  const endPos = getTimePosition(endDate);
  
  if (startPos.top === 0 && startDate.getHours() < 8) {
    // Meeting starts before visible hours
    const visibleEnd = endPos.top || (13 * 60); // End position or end of day
    return { top: 0, height: visibleEnd };
  }
  
  if (endPos.top === 0 && endDate.getHours() >= 21) {
    // Meeting ends after visible hours
    const height = (13 * 60) - startPos.top; // To end of visible day
    return { top: startPos.top, height };
  }
  
  const height = Math.max(endPos.top - startPos.top, 30); // Minimum 30px height
  return { top: startPos.top, height };
}

export default function WeekView({ schedulings, currentDate, onDateChange, onTimeClick, onSchedulingClick, onStatusChange }: WeekViewProps) {
  const weekDates = getWeekDates(currentDate);
  
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };
  
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };
  
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  const handleTimeSlotClick = (date: Date, hour: number) => {
    if (onTimeClick) {
      const clickedDate = new Date(date);
      clickedDate.setHours(hour, 0, 0, 0);
      onTimeClick(clickedDate, hour);
    }
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleDateString('pt-BR', { month: 'short' });
    const endMonth = end.toLocaleDateString('pt-BR', { month: 'short' });
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${startMonth} ${end.getFullYear()}`;
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
  };
  
  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{formatWeekRange()}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Week grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-2 text-sm font-medium border-r">Horário</div>
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`p-2 text-center border-r last:border-r-0 ${
                isToday(date) ? 'bg-primary/10 font-semibold' : ''
              }`}
            >
              <div className="text-xs text-muted-foreground">{DAYS_OF_WEEK[date.getDay()]}</div>
              <div className={`text-sm ${isToday(date) ? 'text-primary' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time slots grid */}
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[60px] p-2 text-xs text-muted-foreground border-b">
                {`${hour}:00`}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDates.map((date, dayIndex) => {
            const daySchedulings = getSchedulingsForDay(schedulings, date);
            
            return (
              <div key={dayIndex} className="relative border-r last:border-r-0">
                {/* Time slot rows */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleTimeSlotClick(date, hour)}
                  />
                ))}
                
                {/* Scheduling blocks (absolutely positioned) */}
                {daySchedulings.map((scheduling) => {
                  const { top, height } = getMeetingPosition(scheduling);
                  
                  if (height === 0) return null;
                  
                  const startDate = new Date(scheduling.meetingDate);
                  const endDate = new Date(scheduling.endDate);
                  const startTime = startDate.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  const endTime = endDate.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <div
                      key={scheduling.id}
                      className={`absolute left-0 right-0 mx-1 px-2 py-1 rounded border ${getStatusColor(scheduling.status)} overflow-hidden group`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        zIndex: 10,
                      }}
                      title={`${startTime} - ${endTime}\n${scheduling.meetingReason?.name || 'Reunião'}\n${scheduling.client?.name ? `Cliente: ${scheduling.client.name}` : 'Sem cliente'}`}
                    >
                      <div className="cursor-pointer" onClick={() => onSchedulingClick(scheduling)}>
                        <div className="text-xs font-semibold truncate">
                          {startTime} - {endTime}
                        </div>
                        <div className="text-xs truncate">
                          {scheduling.meetingReason?.name || 'Reunião'}
                        </div>
                        {scheduling.client && (
                          <div className="text-xs truncate opacity-75">
                            {scheduling.client.name}
                          </div>
                        )}
                      </div>
                      {height > 80 && onStatusChange && scheduling.status !== 'Confirmado' && scheduling.status !== 'Cancelado' && (
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-5 px-2 text-[10px] bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(scheduling.id, 'Confirmado');
                            }}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-5 px-2 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(scheduling.id, 'Cancelado');
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
