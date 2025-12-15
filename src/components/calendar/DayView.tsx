"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock, User, FileText } from "lucide-react";

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

interface DayViewProps {
  schedulings: Scheduling[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onTimeClick?: (date: Date, hour: number, minute: number) => void;
  onSchedulingClick?: (scheduling: Scheduling) => void;
  onStatusChange?: (schedulingId: string, newStatus: 'Confirmado' | 'Cancelado') => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const TIME_SLOTS = HOURS.flatMap(hour => [
  { hour, minute: 0 },
  { hour, minute: 30 }
]); // 30-minute intervals

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

function getSchedulingsForDay(schedulings: Scheduling[], date: Date): Scheduling[] {
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
  }).sort((a, b) => {
    return new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime();
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
  const top = (topHour + topMinutes) * 120; // 120px per hour (60px per 30min slot)
  
  return { top, height: 0 };
}

function getMeetingPosition(scheduling: Scheduling): { top: number; height: number } {
  const startDate = new Date(scheduling.meetingDate);
  const endDate = new Date(scheduling.endDate);
  
  const startPos = getTimePosition(startDate);
  const endPos = getTimePosition(endDate);
  
  if (startPos.top === 0 && startDate.getHours() < 8) {
    // Meeting starts before visible hours
    const visibleEnd = endPos.top || (13 * 120); // End position or end of day
    return { top: 0, height: visibleEnd };
  }
  
  if (endPos.top === 0 && endDate.getHours() >= 21) {
    // Meeting ends after visible hours
    const height = (13 * 120) - startPos.top; // To end of visible day
    return { top: startPos.top, height };
  }
  
  const height = Math.max(endPos.top - startPos.top, 60); // Minimum 60px height
  return { top: startPos.top, height };
}

export default function DayView({ 
  schedulings, 
  currentDate, 
  onDateChange, 
  onTimeClick,
  onSchedulingClick,
  onStatusChange
}: DayViewProps) {
  const daySchedulings = getSchedulingsForDay(schedulings, currentDate);
  
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };
  
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  const handleTimeSlotClick = (hour: number, minute: number) => {
    if (onTimeClick) {
      const clickedDate = new Date(currentDate);
      clickedDate.setHours(hour, minute, 0, 0);
      onTimeClick(clickedDate, hour, minute);
    }
  };
  
  const isToday = () => {
    const today = new Date();
    return currentDate.getDate() === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };
  
  const formatDate = () => {
    return currentDate.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold capitalize">
          {formatDate()}
          {isToday() && <span className="ml-2 text-sm text-primary">(Hoje)</span>}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Day timeline */}
      <div className="border rounded-lg overflow-hidden">
        <div className="flex">
          {/* Time column */}
          <div className="w-24 flex-shrink-0 border-r">
            {TIME_SLOTS.map(({ hour, minute }, index) => (
              <div 
                key={index} 
                className="h-[60px] p-2 text-xs text-muted-foreground border-b flex items-start"
              >
                {minute === 0 && `${hour}:00`}
              </div>
            ))}
          </div>
          
          {/* Schedule column */}
          <div className="flex-1 relative">
            {/* Time slot rows */}
            {TIME_SLOTS.map(({ hour, minute }, index) => (
              <div
                key={index}
                className="h-[60px] border-b cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleTimeSlotClick(hour, minute)}
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
                <Card
                  key={scheduling.id}
                  className={`absolute left-2 right-2 p-3 ${getStatusColor(scheduling.status)} group`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    zIndex: 10,
                  }}
                >
                  <div className="space-y-2 h-full overflow-auto cursor-pointer" onClick={() => onSchedulingClick?.(scheduling)}>
                    {/* Time and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Clock className="h-3 w-3" />
                        {startTime} - {endTime}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {scheduling.status}
                      </Badge>
                    </div>
                    
                    {/* Meeting Reason */}
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <FileText className="h-3 w-3" />
                      {scheduling.meetingReason?.name || 'Reunião'}
                    </div>
                    
                    {/* Client Info */}
                    {scheduling.client && (
                      <div className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        Cliente: {scheduling.client.name}
                      </div>
                    )}
                    
                    {/* Consultant Info */}
                    {scheduling.user && (
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <User className="h-3 w-3" />
                        Consultor: {scheduling.user.name}
                      </div>
                    )}
                    
                    {/* Observations */}
                    {scheduling.observations && height > 100 && (
                      <div className="text-xs opacity-75 line-clamp-2">
                        {scheduling.observations}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {onStatusChange && scheduling.status !== 'Confirmado' && scheduling.status !== 'Cancelado' && (
                      <div className="flex gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
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
                          className="flex-1 h-7 text-xs"
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
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Empty state */}
      {daySchedulings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum agendamento para este dia</p>
        </div>
      )}
    </div>
  );
}
