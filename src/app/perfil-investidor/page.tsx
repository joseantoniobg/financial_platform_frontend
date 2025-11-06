'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, TrendingUp, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Answer {
  id: string;
  answerText: string;
  weight: number;
  orderIndex: number;
}

interface Question {
  id: string;
  questionText: string;
  orderIndex: number;
  answers: Answer[];
}

interface QuestionnaireResponse {
  questionId: string;
  answerId: string;
}

export default function InvestorProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, string>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    questionnaireId: string;
    totalWeight: number;
    averageWeight: number;
    riskProfile: string;
    completedAt: string;
  } | null>(null);
  const [latestProfile, setLatestProfile] = useState<{
    riskProfile: string;
    completedAt: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuestions();
      fetchLatestProfile();
    }
  }, [isAuthenticated]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/investor-profile/questions');
      const data = await res.json();
      
      if (res.ok) {
        setQuestions(data.questions);
      } else {
        toast.error('Erro ao carregar questionário');
      }
    } catch (error) {
      toast.error('Erro ao carregar questionário');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestProfile = async () => {
    try {
      const res = await fetch('/api/investor-profile/latest');
      const data = await res.json();
      
      if (res.ok && data) {
        setLatestProfile({
          riskProfile: data.riskProfile,
          completedAt: data.completedAt,
        });
      }
    } catch (error) {
      // Silent fail - user may not have completed profile yet
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    const newResponses = new Map(responses);
    newResponses.set(questions[currentQuestionIndex].id, answerId);
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (responses.size !== questions.length) {
      toast.error('Por favor, responda todas as questões');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        responses: Array.from(responses.entries()).map(([questionId, answerId]) => ({
          questionId,
          answerId,
        })),
      };

      const res = await fetch('/api/investor-profile/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setShowResult(true);
        toast.success('Perfil de investidor atualizado com sucesso!');
      } else {
        toast.error(data.message || 'Erro ao enviar respostas');
      }
    } catch (error) {
      toast.error('Erro ao enviar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'Conservador':
        return 'text-blue-600 dark:text-blue-400';
      case 'Moderado':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Arrojado':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskProfileDescription = (profile: string) => {
    switch (profile) {
      case 'Conservador':
        return 'Você busca preservar seu capital com investimentos de menor risco e retorno mais estável.';
      case 'Moderado':
        return 'Você busca um equilíbrio entre segurança e crescimento, aceitando algum risco para obter retornos moderados.';
      case 'Arrojado':
        return 'Você está disposto a assumir riscos maiores em busca de retornos mais elevados no longo prazo.';
      default:
        return '';
    }
  };

  if (!isAuthenticated || !user) return null;

  const isClient = user.roles?.some(role => role.name === 'Cliente');
  
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
          <Loader2 className="h-8 w-8 animate-spin text-[#B4F481]" />
        </div>
      </DashboardLayout>
    );
  }

  if (showResult && result) {
    return (
      <DashboardLayout userName={user.name}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="h-16 w-16 text-[#B4F481] mx-auto" />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Perfil de Investidor Atualizado!
            </h1>
            <p className="text-slate-600 dark:text-gray-400">
              Obrigado por responder o questionário
            </p>
          </div>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Seu Perfil</CardTitle>
              <CardDescription>Baseado nas suas respostas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className={`text-5xl font-bold ${getRiskProfileColor(result.riskProfile)}`}>
                  {result.riskProfile}
                </div>
                <p className="text-slate-600 dark:text-gray-400">
                  {getRiskProfileDescription(result.riskProfile)}
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Dica:</strong> Este perfil ajudará seu consultor a recomendar investimentos adequados ao seu perfil de risco.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                onClick={() => router.push('/home')}
                className="flex-1 bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F]"
              >
                Voltar ao Início
              </Button>
              <Button
                onClick={() => router.push('/perfil-investidor/historico')}
                variant="outline"
                className="flex-1"
              >
                Ver Histórico
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = currentQuestion ? responses.get(currentQuestion.id) : undefined;
  const canProceed = currentAnswer !== undefined;

  return (
    <DashboardLayout userName={user.name}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Perfil de Investidor
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Responda as questões abaixo para identificarmos seu perfil de investidor
          </p>
        </div>

        {latestProfile && latestProfile.riskProfile !== 'Nenhum' && (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">
                    Perfil Atual: <span className={getRiskProfileColor(latestProfile.riskProfile)}>{latestProfile.riskProfile}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    Última atualização: {new Date(latestProfile.completedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-gray-400">
            <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {currentQuestion && (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
                {currentQuestion.orderIndex === 6 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200">
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          <strong>Obs.:</strong> Patrimônio financeiro = investimentos + saldo em conta + reserva + aplicações. Não inclui imóveis nem carros.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <CardDescription>Escolha a opção que melhor se adequa ao seu perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentAnswer}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {currentQuestion.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      currentAnswer === answer.id
                        ? 'border-[#B4F481] bg-[#B4F481]/10 dark:bg-[#B4F481]/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleAnswerSelect(answer.id)}
                  >
                    <RadioGroupItem value={answer.id} id={answer.id} />
                    <Label
                      htmlFor={answer.id}
                      className="flex-1 cursor-pointer text-slate-800 dark:text-white font-medium"
                    >
                      {answer.answerText}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || submitting}
                  className="bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Finalizar
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F]"
                >
                  Próxima
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        <div className="text-center">
          <Button
            onClick={() => router.push('/home')}
            variant="ghost"
            className="text-slate-600 dark:text-gray-400"
          >
            Cancelar e Voltar
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
