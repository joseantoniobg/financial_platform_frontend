'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { SchedulingFormDialog } from '@/components/SchedulingFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Scheduling {
  id: string;
  userId: string;
  meetingReasonId: string;
  meetingDate: string;
  status: 'Pendente' | 'Realizado' | 'Cancelado';
  observations?: string;
  user?: {
    name: string;
    email: string;
  };
  meetingReason: {
    name: string;
  };
}

type Client = {
  id: string;
  name: string;
  email: string;
};

export default function Schedulings({ client }: { client: Client | null }) {
  const { user } = useAuthStore();
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScheduling, setEditingScheduling] = useState<Scheduling | null>(null);
  const [deletingScheduling, setDeletingScheduling] = useState<Scheduling | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userRoles = user?.roles?.map((role) => role.name) || [];
  const isAdminOrConsultor = userRoles.includes('Administrador') || userRoles.includes('Consultor');
  const isCliente = userRoles.includes('Cliente');

  useEffect(() => {
    fetchSchedulings();
  }, []);

  const fetchSchedulings = async () => {
    try {
      setLoading(true);
      const url = `/api/schedulings/user/${client?.id}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao carregar agendamentos');
      
      const data = await response.json();
      setSchedulings(data);
    } catch (error) {
      toast.error('Erro ao carregar agendamentos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingScheduling(null);
    setDialogOpen(true);
  };

  const handleEdit = (scheduling: Scheduling) => {
    setEditingScheduling(scheduling);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingScheduling) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/schedulings/${deletingScheduling.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar agendamento');

      toast.success('Agendamento removido com sucesso');
      setDeletingScheduling(null);
      fetchSchedulings();
    } catch (error) {
      toast.error('Erro ao deletar agendamento');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-500';
      case 'Realizado':
        return 'bg-green-500';
      case 'Cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">
            {isCliente
              ? 'Visualize suas reuniões agendadas'
              : 'Gerencie os agendamentos de reuniões com clientes'}
          </p>
        </div>
        {isAdminOrConsultor && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
      </div>

      {schedulings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum agendamento encontrado
            </p>
            {isAdminOrConsultor && (
              <Button onClick={handleAdd} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Agendamento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedulings.map((scheduling) => (
            <Card key={scheduling.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {scheduling.meetingReason.name}
                    </CardTitle>
                    {scheduling.user && (
                      <CardDescription className="mt-1">
                        {scheduling.user.name}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className={getStatusColor(scheduling.status)}>
                    {scheduling.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(scheduling.meetingDate)}
                  </div>
                  
                  {scheduling.observations && (
                    <p className="text-sm text-muted-foreground">
                      {scheduling.observations}
                    </p>
                  )}

                  {isAdminOrConsultor && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="edit"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(scheduling)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingScheduling(scheduling)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      {isAdminOrConsultor && client && (
        <SchedulingFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          scheduling={editingScheduling}
          onSuccess={fetchSchedulings}
          client={client}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingScheduling}
        onOpenChange={(open) => !open && setDeletingScheduling(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
