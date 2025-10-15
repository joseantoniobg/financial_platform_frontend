'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Senha redefinida com sucesso!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1929] px-4">
      <div className="bg-[#0D2744] p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Redefinir Senha
        </h1>
        <p className="text-gray-400 mb-8 text-center">
          Crie uma nova senha para sua conta
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Nova Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0A1929] text-white border border-gray-600 focus:border-[#B4F481] focus:ring-2 focus:ring-[#B4F481] focus:outline-none transition-colors"
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0A1929] text-white border border-gray-600 focus:border-[#B4F481] focus:ring-2 focus:ring-[#B4F481] focus:outline-none transition-colors"
              placeholder="Digite a senha novamente"
              disabled={isLoading}
            />
          </div>

          {password && password.length < 6 && (
            <p className="text-red-400 text-sm">A senha deve ter pelo menos 6 caracteres</p>
          )}

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-red-400 text-sm">As senhas não coincidem</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#B4F481] hover:bg-[#9FD96F] text-[#0A1929] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
