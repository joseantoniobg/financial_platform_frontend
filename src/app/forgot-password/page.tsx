'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email inválido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verifique seu email para redefinir sua senha');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Erro ao enviar email');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1929] px-4">
      <div className="bg-[#0D2744] p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Esqueceu sua senha?
        </h1>
        <p className="text-gray-400 mb-8 text-center">
          Insira seu email e enviaremos um link para redefinir sua senha
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0A1929] text-white border border-gray-600 focus:border-[#B4F481] focus:ring-2 focus:ring-[#B4F481] focus:outline-none transition-colors"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#B4F481] hover:bg-[#9FD96F] text-[#0A1929] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full py-3 px-4 bg-transparent hover:bg-[#0A1929] text-white font-medium rounded-lg transition-colors border border-gray-600"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    </div>
  );
}
