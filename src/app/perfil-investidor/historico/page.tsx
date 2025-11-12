'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageTitle } from '@/components/ui/page-title';

interface QuestionnaireHistory {
  id: string;
  completedAt: string;
  totalWeight: number;
  averageWeight: number;
  riskProfile: string;
  responsesCount: number;
  responses: {
    question: string;
    answer: string;
    weight: number;
  }[];
}

export default function InvestorProfileHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireHistory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/investor-profile/my-questionnaires');
      const data = await res.json();
      
      if (res.ok) {
        setQuestionnaires(data.questionnaires || []);
      } else {
        toast.error('Erro ao carregar histórico');
      }
    } catch {
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'Conservador':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'Moderado':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Arrojado':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  if (!isAuthenticated || !user) return null;

  const isClient = user.roles?.some((role: any) => role.name === 'Cliente');
  
  if (!isClient) {
    return (
      <DashboardLayout userName={user.name}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Apenas clientes podem acessar esta página.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout userName={user.name}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--card-accent))]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user.name}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/perfil-investidor')}
            className="p-2 hover:bg-[hsl(var(--card-accent))]/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[hsl(var(--foreground))]" />
          </button>
          <PageTitle title='Histórico de Perfil de Investidor' subtitle='Visualize todos os questionários respondidos' />
        </div>

        {questionnaires.length === 0 ? (
          <Card className="border-[hsl(var(--app-border))] max-w-md mx-auto">
            <CardContent className="pt-6 text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-gray-400 mb-4">
                Você ainda não respondeu nenhum questionário
              </p>
              <Button
                onClick={() => router.push('/perfil-investidor')}
                className="bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary-hover))]"
              >
                Responder Questionário
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questionnaires.map((questionnaire) => (
              <Card key={questionnaire.id} className="border-[hsl(var(--app-border))] bg-[hsl(var(--card))]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[hsl(var(--foreground))]" />
                        <CardTitle className="text-lg">
                          {new Date(questionnaire.completedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {questionnaire.responsesCount} questões respondidas
                      </CardDescription>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold ${getRiskProfileColor(questionnaire.riskProfile)}`}>
                      {questionnaire.riskProfile}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-[hsl(var(--card-accent))]/30 rounded-lg border border-[hsl(var(--app-border))]">
                    <div>
                      <p className="text-sm text-[hsl(var(--foreground))] text-center">Pontuação Total</p>
                      <p className="text-[3rem] font-bold text-[hsl(var(--foreground-clear))] text-center">
                        {questionnaire.totalWeight}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[hsl(var(--foreground))] text-center">Média</p>
                      <p className="text-[3rem] font-bold text-[hsl(var(--foreground-clear))] text-center">
                        {questionnaire.averageWeight.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {expandedId === questionnaire.id && (
                    <div className="space-y-3 pt-4 border-t border-[hsl(var(--app-border))]">
                      <h4 className="font-semibold text-[hsl(var(--foreground))]">Respostas:</h4>
                      {questionnaire.responses.map((response, index) => (
                        <div key={index} className="p-3 bg-[hsl(var(--card-accent))]/30 rounded-lg border border-[hsl(var(--app-border))]">
                          <p className="font-medium text-[hsl(var(--foreground))] mb-1">
                            {response.question}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-[hsl(var(--foreground-clear))]">
                              {response.answer}
                            </p>
                            
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => setExpandedId(expandedId === questionnaire.id ? null : questionnaire.id)}
                    variant="outline"
                    className="w-full hover:bg-[hsl(var(--card-accent))]/20"
                  >
                    {expandedId === questionnaire.id ? 'Ocultar' : 'Ver'} Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => router.push('/perfil-investidor')}
            className="bg-[hsl(var(--primary))] text-[#0A1929] hover:bg-[#9FD96F]"
          >
            Responder Novo Questionário
          </Button>
          <Button
            onClick={() => router.push('/home')}
            variant="outline"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
