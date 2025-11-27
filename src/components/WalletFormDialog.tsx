'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

interface Wallet {
  id: string;
  title: string;
  description?: string;
}

interface WalletFormDialogProps {
  open: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
  userId: string;
  onSuccess: () => void;
}

export function WalletFormDialog({ open, onClose, wallet, userId, onSuccess }: WalletFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (wallet) {
      setTitle(wallet.title);
      setDescription(wallet.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = wallet
        ? `/api/wallets/${wallet.id}`
        : `/api/wallets/user/${userId}`;
      
      const method = wallet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success(wallet ? 'Carteira atualizada com sucesso!' : 'Carteira criada com sucesso!');
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Erro ao salvar carteira');
      }
    } catch (error) {
      console.error('Error saving wallet:', error);
      toast.error('Erro ao salvar carteira');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{wallet ? 'Editar Carteira' : 'Nova Carteira'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Ex: Conta Principal, Investimentos..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Observações</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Observações sobre esta carteira..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
