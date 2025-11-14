'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('A nova senha deve ser diferente da atual');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Senha alterada com sucesso!');
        router.push('/home');
      } else {
        toast.error(data.message || 'Erro ao alterar senha');
      }
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[hsl(var(--primary))]/10 p-3 rounded-full">
              <Lock className="h-8 w-8 text-[hsl(var(--primary))]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Alterar Senha
          </h1>
          <p className="text-gray-400 text-center mb-6">
            {user?.name ? `Olá, ${user.name}!` : 'Olá!'} Por segurança, você precisa alterar sua senha temporária.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-300">
                Senha Atual <span className="text-red-400">*</span>
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="border-gray-600"
                placeholder="Digite sua senha temporária"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">
                Nova Senha <span className="text-red-400">*</span>
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="border-gray-600"
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirmar Nova Senha <span className="text-red-400">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="border-gray-600"
                placeholder="Digite novamente a nova senha"
                disabled={loading}
              />
            </div>

            <div className="bg-[hsl(var(--foreground-clear))]/20 border border-[hsl(var(--primary))]/50 rounded p-3">
              <p className="text-sm text-[hsl(var(--primary))]">
                <strong>Requisitos da senha:</strong>
                <br />
                • Mínimo de 6 caracteres
                <br />
                • Diferente da senha temporária
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] font-bold py-3 rounded-lg hover:bg-[hsl(var(--primary-hover))] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
