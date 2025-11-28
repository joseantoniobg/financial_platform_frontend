'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletFormDialog } from '@/components/WalletFormDialog';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Wallet as WalletIcon, Plus } from 'lucide-react';
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
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { PageTitle } from '@/components/ui/page-title';
import { useLoadingStore } from '@/store/loadingStore';
import { StLoading } from '@/components/StLoading';

interface Wallet {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function WalletsPage() {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {   
    setLoading(true);
    try {
      const response = await fetch(`/api/wallets/user/${user?.sub}`);
      if (response.ok) {
        const data = await response.json();
        setWallets(data);
      } else {
        toast.error('Erro ao carregar carteiras');
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Erro ao carregar carteiras');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingWallet(null);
    setDialogOpen(true);
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingWallet) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/wallets/${deletingWallet.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Carteira excluída com sucesso!');
        fetchWallets();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Erro ao excluir carteira');
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast.error('Erro ao excluir carteira');
    } finally {
      setIsDeleting(false);
      setDeletingWallet(null);
    }
  };

  return (
     <DashboardLayout>
      <StLoading loading={loading}>
        <div className="container mx-auto py-8 px-4">
            <div className='mb-4 flex justify-between'>
                <PageTitle title="Carteiras" subtitle="Gerencie suas carteiras financeiras" />
                {wallets.length > 0 &&
                       (<Button onClick={handleAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                                Criar Carteira
                        </Button>)}
            </div>
            {wallets.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <WalletIcon className="w-16 h-16 text-[hsl(var(--muted-foreground))]" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma carteira cadastrada</h3>
                        <p className="text-[hsl(var(--muted-foreground))] mb-4 text-center">
                            Crie carteiras para organizar suas transações em diferentes bolsos
                        </p>
                        <Button onClick={handleAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                                Criar Primeira Carteira
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wallets.map((wallet) => (
                    <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <WalletIcon className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{wallet.title}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                            <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(wallet)}
                            className="h-8 w-8 p-0"
                            >
                            <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingWallet(wallet)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                            <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {wallet.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3">{wallet.description}</p>
                        )}
                        {!wallet.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] italic">Sem observações</p>
                        )}
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
                        Criada em {new Date(wallet.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </CardContent>
                    </Card>
                ))}
                </div>
            )}

            {user?.sub && (
                <WalletFormDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    wallet={editingWallet}
                    userId={user?.sub}
                    onSuccess={fetchWallets}
                />
            )}

            <AlertDialog open={!!deletingWallet} onOpenChange={(open) => !open && setDeletingWallet(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                    Tem certeza que deseja excluir a carteira <strong>{deletingWallet?.title}</strong>?
                    <br />
                    <br />
                    As transações vinculadas a esta carteira não serão excluídas, mas perderão o vínculo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </StLoading>
    </DashboardLayout>
  );
}
