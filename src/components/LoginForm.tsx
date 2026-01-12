'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from '@/store/authStore';
import { useRedirectIfAuthenticated } from '@/hooks/useAuth';
import { Stock } from '@/types/stock';
import { ErrorText } from './ui/error-text';
import Image from 'next/image';

interface LoginFormProps {
  stocks: Stock[];
}

export function LoginForm({ stocks }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  useRedirectIfAuthenticated();

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('E-mail / Login é obrigatório');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Senha é obrigatória');
      return false;
    }
    if (value.length < 3) {
      setPasswordError('Senha deve ter no mínimo 3 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { login: email, password });

      if (response.data.success && response.data.user) {
        const user = response.data.user;
        const mustChangePassword = response.data.mustChangePassword;
        
        setAuth(user);
        
        if (mustChangePassword) {
          toast.success(`Bem-vindo, ${user.name}! Por favor, altere sua senha.`);
          setTimeout(() => {
            router.replace('/change-password');
          }, 500);
          return;
        }
      
        toast.success(`Bem-vindo, ${user.name}!`);
        
        setTimeout(() => {
          router.replace('/home');
        }, 500);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorMessage = err.response.data.message || 'Falha no login. Tente novamente.';
        toast.error(errorMessage);
        setPasswordError(errorMessage);
      } else {
        const errorMessage = 'Ocorreu um erro. Tente novamente mais tarde.';
        toast.error(errorMessage);
        setPasswordError(errorMessage);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2'>
    <div className='hidden lg:block'>
        <div style={{ backgroundImage: 'url(/back.jpg)', minHeight: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p className='text-3xl text-white text-center w-[60%]'>Bem-vindo(a)!<br/><br/>Seu espaço pessoal para organizar suas finanças, aprender e conquistar seus objetivos com mais clareza e estratégia</p>
        </div>
    </div>
    <div className="flex bg-white items-center justify-center min-h-screen relative overflow-hidden">
        {/* Background gradient circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-[480px] mx-4">
          {/* <div className="mb-6">
            <StockCarousel stocks={stocks} />
          </div> */}

          {/* Login Card */}
          <div className="rounded-2xl p-8 relative">
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-[hsl(var(--foreground))] text-3xl font-bold">
                  Plataforma Financeira
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[hsl(var(--foreground))] text-sm font-medium">
                  Login / e-mail
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder='Seu login ou e-mail'
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    className={`h-12 border-[hsl(var(--app-border))] focus:border-[hsl(var(--border))] focus:ring-0 ${
                      emailError ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <ErrorText>{emailError}</ErrorText>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[hsl(var(--foreground))] text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      placeholder='Sua senha'
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) validatePassword(e.target.value);
                      }}
                      onBlur={(e) => validatePassword(e.target.value)}
                      className={`h-12 border-[hsl(var(--app-border))] focus:border-[hsl(var(--border))] focus:ring-0 ${
                        passwordError ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorText>{passwordError}</ErrorText>
                </div>

                {/* Login button */}
                <Button
                  type="submit"
                  className="w-full h-12 font-bold text-sm rounded-lg transition-colors uppercase"
                  disabled={isLoading}
                >
                  {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
                </Button>
              </form>
              <div className="text-center pt-2">
                <a href="/forgot-password" className="text-[hsl(var(--foreground))] text-sm hover:underline">
                  Esqueci minha senha
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
