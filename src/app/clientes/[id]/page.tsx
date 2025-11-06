'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Save, TrendingUp, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PhoneInput } from '@/components/ui/phone-input';
import { DateInput } from '@/components/ui/date-input';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { DocumentInput } from '@/components/ui/document-input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Role {
  id: string;
  name: string;
}

interface ClientCategory {
  id: string;
  name: string;
  description: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface State {
  id: string;
  name: string;
  code: string;
  country?: Country;
}

interface City {
  id: string;
  name: string;
  state?: State;
}

interface Client {
  id: string;
  login: string;
  name: string;
  email: string;
  roles: Role[];
  status: 'active' | 'inactive';
  clientCategory?: ClientCategory;
  contact?: string;
  birthDate?: string;
  city?: City;
  consultancyType?: 'Financeira' | 'Empresarial' | 'Pessoal';
  lastMeeting?: string;
  // New fields
  document?: string;
  plan?: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual' | 'Personalizado';
  planValue?: number;
  contractNumber?: string;
  contractStatus?: 'Ativo' | 'Inativo' | 'Encerrado' | 'Em negociação';
  consultant?: {
    id: string;
    name: string;
  };
  contractStartDate?: string;
  contractEndDate?: string;
  address?: string;
  prospectionOrigin?: 'Indicação' | 'Instagram' | 'Site' | 'Eventos' | 'Outro';
  profession?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditClientPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('dados-cadastrais');
  const [consultants, setConsultants] = useState<{ id: string; name: string }[]>([]);
  
  // Investor Profile state
  const [latestQuestionnaire, setLatestQuestionnaire] = useState<any>(null);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [showNewQuestionnaire, setShowNewQuestionnaire] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, string>>(new Map());

  const [categories, setCategories] = useState<ClientCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    login: '',
    name: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
    categoryId: '' as string,
    contact: '' as string,
    birthDate: '' as string,
    countryId: '' as string,
    stateId: '' as string,
    cityId: '' as string,
    consultancyType: '' as string,
    lastMeeting: '' as string,
    // New fields
    document: '' as string,
    plan: '' as string,
    planValue: '' as string,
    contractNumber: '' as string,
    contractStatus: '' as string,
    consultantId: '' as string,
    contractStartDate: '' as string,
    contractEndDate: '' as string,
    address: '' as string,
    prospectionOrigin: '' as string,
    profession: '' as string,
  });

  const fetchClient = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        
        const countryId = data.city?.state?.country?.id || '';
        const stateId = data.city?.state?.id || '';
        const cityId = data.city?.id || '';

        setFormData({
          login: data.login,
          name: data.name,
          email: data.email,
          status: data.status,
          categoryId: data.clientCategory?.id || '',
          contact: data.contact || '',
          birthDate: data.birthDate || '',
          countryId,
          stateId,
          cityId,
          consultancyType: data.consultancyType || '',
          lastMeeting: data.lastMeeting || '',
          // New fields
          document: data.document || '',
          plan: data.plan || '',
          planValue: data.planValue ? data.planValue.toString() : '',
          contractNumber: data.contractNumber || '',
          contractStatus: data.contractStatus || '',
          consultantId: data.consultant?.id || '',
          contractStartDate: data.contractStartDate || '',
          contractEndDate: data.contractEndDate || '',
          address: data.address || '',
          prospectionOrigin: data.prospectionOrigin || '',
          profession: data.profession || '',
        });

        // Load states and cities if client has location data
        if (countryId) {
          await fetchStates(countryId);
        }
        if (stateId) {
          await fetchCities(stateId);
        }
      } else {
        toast.error('Erro ao carregar cliente');
        router.push('/clientes');
      }
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      router.push('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/client-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      console.error('Error fetching categories');
    }
  };

  const fetchConsultants = async () => {
    try {
      const res = await fetch('/api/users?limit=1000');
      if (res.ok) {
        const data = await res.json();
        // Filter only users who are not clients (consultants/admins)
        const nonClients = data.users.filter((u: any) => 
          !u.roles.some((r: any) => r.name === 'Cliente')
        );
        setConsultants(nonClients.map((u: any) => ({ id: u.id, name: u.name })));
      }
    } catch {
      console.error('Error fetching consultants');
    }
  };

  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const res = await fetch('/api/locations/countries');
      if (res.ok) {
        const data = await res.json();
        setCountries(data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  const fetchStates = useCallback(async (countryId: string) => {
    if (!countryId) return;
    setLoadingStates(true);
    try {
      const res = await fetch(`/api/locations/states?countryId=${countryId}`);
      if (res.ok) {
        const data = await res.json();
        setStates(data);
      }
    } catch {
      console.error('Error fetching states');
    } finally {
      setLoadingStates(false);
    }
  }, []);

  const fetchCities = useCallback(async (stateId: string) => {
    if (!stateId) return;
    setLoadingCities(true);
    try {
      const res = await fetch(`/api/locations/cities?stateId=${stateId}`);
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch {
      console.error('Error fetching cities');
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClient();
      fetchCategories();
      fetchCountries();
      fetchConsultants();
    }
  }, [isAuthenticated, clientId]);

  const handleCountryChange = (countryId: string) => {
    setFormData(prev => ({
      ...prev,
      countryId,
      stateId: '',
      cityId: '',
    }));
    setStates([]);
    setCities([]);
    if (countryId) {
      fetchStates(countryId);
    }
  };

  const handleStateChange = (stateId: string) => {
    setFormData(prev => ({
      ...prev,
      stateId,
      cityId: '',
    }));
    setCities([]);
    if (stateId) {
      fetchCities(stateId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.login || !formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        login: formData.login,
        name: formData.name,
        email: formData.email,
        roleIds: client?.roles.map(r => r.id) || [],
        status: formData.status,
      };

      if (formData.categoryId) {
        payload.categoryId = formData.categoryId;
      }

      if (formData.contact) {
        payload.contact = formData.contact;
      }

      if (formData.birthDate) {
        payload.birthDate = formData.birthDate;
      }

      if (formData.cityId) {
        payload.cityId = formData.cityId;
      }

      if (formData.consultancyType) {
        payload.consultancyType = formData.consultancyType;
      }

      if (formData.lastMeeting) {
        payload.lastMeeting = formData.lastMeeting;
      }

      // New fields
      if (formData.document) {
        payload.document = formData.document;
      }

      if (formData.plan) {
        payload.plan = formData.plan;
      }

      if (formData.planValue) {
        payload.planValue = parseFloat(formData.planValue);
      }

      if (formData.contractNumber) {
        payload.contractNumber = formData.contractNumber;
      }

      if (formData.contractStatus) {
        payload.contractStatus = formData.contractStatus;
      }

      if (formData.consultantId) {
        payload.consultantId = formData.consultantId;
      }

      if (formData.contractStartDate) {
        payload.contractStartDate = formData.contractStartDate;
      }

      if (formData.contractEndDate) {
        payload.contractEndDate = formData.contractEndDate;
      }

      if (formData.address) {
        payload.address = formData.address;
      }

      if (formData.prospectionOrigin) {
        payload.prospectionOrigin = formData.prospectionOrigin;
      }

      if (formData.profession) {
        payload.profession = formData.profession;
      }

      const res = await fetch(`/api/users/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cliente atualizado com sucesso!');
        router.push('/clientes');
      } else {
        toast.error(data.message || 'Erro ao salvar cliente');
      }
    } catch {
      toast.error('Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  // Investor Profile functions
  const fetchLatestQuestionnaire = useCallback(async () => {
    if (!clientId) return;
    
    setLoadingQuestionnaire(true);
    try {
      const res = await fetch(`/api/investor-profile/client/${clientId}/latest`);
      
      if (res.ok) {
        const data = await res.json();
        setLatestQuestionnaire(data);
      } else {
        setLatestQuestionnaire(null);
      }
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      setLatestQuestionnaire(null);
    } finally {
      setLoadingQuestionnaire(false);
    }
  }, [clientId]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/investor-profile/questions');
      
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      } else {
        toast.error('Erro ao carregar perguntas');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Erro ao carregar perguntas');
    }
  };

  const handleStartNewQuestionnaire = async () => {
    setCurrentQuestionIndex(0);
    setResponses(new Map());
    await fetchQuestions();
    setShowNewQuestionnaire(true);
  };

  const handleSubmitQuestionnaire = async () => {
    if (responses.size !== questions.length) {
      toast.error('Por favor, responda todas as perguntas');
      return;
    }

    const responseArray = Array.from(responses.entries()).map(([questionId, answerId]) => ({
      questionId,
      answerId,
    }));

    try {
      const res = await fetch(`/api/investor-profile/client/${clientId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses: responseArray }),
      });

      if (res.ok) {
        toast.success('Questionário submetido com sucesso!');
        setShowNewQuestionnaire(false);
        setCurrentQuestionIndex(0);
        setResponses(new Map());
        await fetchLatestQuestionnaire();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao submeter questionário');
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast.error('Erro ao submeter questionário');
    }
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'Conservador':
        return 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700';
      case 'Moderado':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700';
      case 'Arrojado':
        return 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700';
    }
  };

  const getRiskProfileDescription = (profile: string) => {
    switch (profile) {
      case 'Conservador':
        return 'Prefere segurança e estabilidade, aceitando retornos menores em troca de menor risco.';
      case 'Moderado':
        return 'Busca equilíbrio entre segurança e rentabilidade, aceitando algum risco calculado.';
      case 'Arrojado':
        return 'Busca máxima rentabilidade e está disposto a aceitar riscos significativos.';
      default:
        return '';
    }
  };

  // Effect to load questionnaire when tab is active
  useEffect(() => {
    if (activeTab === 'perfil-investidor' && clientId) {
      fetchLatestQuestionnaire();
    }
  }, [activeTab, clientId, fetchLatestQuestionnaire]);

  if (!isAuthenticated || !user) return null;

  const isAdmin = user.roles?.some(role => role.name === 'Administrador');
  
  if (!isAdmin) {
    return (
      <DashboardLayout userName={user.name}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Apenas administradores podem acessar esta página.
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

  return (
    <DashboardLayout userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/clientes')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-white" />
          </button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Editar Cliente
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="dados-cadastrais">Dados Cadastrais</TabsTrigger>
                <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
                <TabsTrigger value="planejamento">Planejamento Financeiro</TabsTrigger>
                <TabsTrigger value="perfil-investidor">Perfil de Investidor</TabsTrigger>
              </TabsList>

              {/* Tab: Dados Cadastrais - Contains all 4 sectors */}
              <TabsContent value="dados-cadastrais" className="space-y-8">
                
                {/* Sector 1: Dados Principais */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Dados Principais</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Informações básicas do cliente</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="name" className="text-slate-700 dark:text-gray-300">
                        Nome Completo / Razão Social <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                        disabled={saving}
                        placeholder="Digite o nome completo ou razão social"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-700 dark:text-gray-300">
                        Categoria <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.categoryId || 'none'}
                        onValueChange={(value: string) => setFormData({ ...formData, categoryId: value === 'none' ? '' : value })}
                        disabled={saving}
                      >
                        <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                          <SelectItem value="none" className="text-slate-800 dark:text-white">Selecione</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-slate-800 dark:text-white">
                              {category.name} - {category.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document" className="text-slate-700 dark:text-gray-300">
                        Documento (CPF/CNPJ)
                      </Label>
                      <DocumentInput
                        value={formData.document}
                        enabled={(categories.find(c => c.id === formData.categoryId)?.name ?? '') !== ''}
                        onChange={(value) => setFormData({ ...formData, document: value })}
                        category={categories.find(c => c.id === formData.categoryId)?.name === 'PF' ? 'PF' : 'PJ'}
                        className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      />
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        {categories.find(c => c.id === formData.categoryId)?.name === 'PF' ? 'CPF: 000.000.000-00' : 'CNPJ: 00.000.000/0000-00'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-slate-700 dark:text-gray-300">
                        Data de Nascimento / Fundação
                      </Label>
                      <DateInput
                        id="birthDate"
                        value={formData.birthDate}
                        onChange={(value) => setFormData({ ...formData, birthDate: value })}
                        className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-slate-700 dark:text-gray-300">
                        Idade
                      </Label>
                      <Input
                        id="age"
                        value={formData.birthDate ? (() => {
                          const birth = new Date(formData.birthDate);
                          const today = new Date();
                          let age = today.getFullYear() - birth.getFullYear();
                          const monthDiff = today.getMonth() - birth.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                            age--;
                          }
                          return age >= 0 ? `${age} anos` : '';
                        })() : ''}
                        className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                        disabled
                        placeholder="Calculado automaticamente"
                      />
                    </div>
                  </div>
                </div>

                {/* Sector 2: Informações da Consultoria */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Informações da Consultoria</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Detalhes do contrato e plano</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultancyType" className="text-slate-700 dark:text-gray-300">
                      Tipo de Consultoria
                    </Label>
                    <Select
                      value={formData.consultancyType || 'none'}
                      onValueChange={(value: string) => setFormData({ ...formData, consultancyType: value === 'none' ? '' : value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                        <SelectItem value="none" className="text-slate-800 dark:text-white">Nenhum</SelectItem>
                        <SelectItem value="Financeira" className="text-slate-800 dark:text-white">Financeira</SelectItem>
                        <SelectItem value="Empresarial" className="text-slate-800 dark:text-white">Empresarial</SelectItem>
                        <SelectItem value="Pessoal" className="text-slate-800 dark:text-white">Pessoal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan" className="text-slate-700 dark:text-gray-300">
                      Plano
                    </Label>
                    <Select
                      value={formData.plan || 'none'}
                      onValueChange={(value: string) => setFormData({ ...formData, plan: value === 'none' ? '' : value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                        <SelectItem value="none" className="text-slate-800 dark:text-white">Nenhum</SelectItem>
                        <SelectItem value="Mensal" className="text-slate-800 dark:text-white">Mensal</SelectItem>
                        <SelectItem value="Trimestral" className="text-slate-800 dark:text-white">Trimestral</SelectItem>
                        <SelectItem value="Semestral" className="text-slate-800 dark:text-white">Semestral</SelectItem>
                        <SelectItem value="Anual" className="text-slate-800 dark:text-white">Anual</SelectItem>
                        <SelectItem value="Personalizado" className="text-slate-800 dark:text-white">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="planValue" className="text-slate-700 dark:text-gray-300">
                      Valor do Plano (R$)
                    </Label>
                    <CurrencyInput
                      value={formData.planValue}
                      onChange={(value) => setFormData({ ...formData, planValue: value.toString() })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractNumber" className="text-slate-700 dark:text-gray-300">
                      Contrato nº
                    </Label>
                    <Input
                      id="contractNumber"
                      value={formData.contractNumber}
                      onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                      placeholder="Ex: 028/2025"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractStatus" className="text-slate-700 dark:text-gray-300">
                      Situação / Status
                    </Label>
                    <Select
                      value={formData.contractStatus || 'none'}
                      onValueChange={(value: string) => setFormData({ ...formData, contractStatus: value === 'none' ? '' : value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                        <SelectItem value="none" className="text-slate-800 dark:text-white">Nenhum</SelectItem>
                        <SelectItem value="Ativo" className="text-slate-800 dark:text-white">Ativo</SelectItem>
                        <SelectItem value="Inativo" className="text-slate-800 dark:text-white">Inativo</SelectItem>
                        <SelectItem value="Encerrado" className="text-slate-800 dark:text-white">Encerrado</SelectItem>
                        <SelectItem value="Em negociação" className="text-slate-800 dark:text-white">Em negociação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultant" className="text-slate-700 dark:text-gray-300">
                      Consultor Responsável
                    </Label>
                    <Select
                      value={formData.consultantId || 'none'}
                      onValueChange={(value: string) => setFormData({ ...formData, consultantId: value === 'none' ? '' : value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                        <SelectItem value="none" className="text-slate-800 dark:text-white">Nenhum</SelectItem>
                        {consultants.map((consultant) => (
                          <SelectItem key={consultant.id} value={consultant.id} className="text-slate-800 dark:text-white">
                            {consultant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractStartDate" className="text-slate-700 dark:text-gray-300">
                      Data de Início
                    </Label>
                    <DateInput
                      id="contractStartDate"
                      value={formData.contractStartDate}
                      onChange={(value) => setFormData({ ...formData, contractStartDate: value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractEndDate" className="text-slate-700 dark:text-gray-300">
                      Data de Fim
                    </Label>
                    <DateInput
                      id="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={(value) => setFormData({ ...formData, contractEndDate: value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastMeeting" className="text-slate-700 dark:text-gray-300">
                      Último Atendimento
                    </Label>
                    <DateInput
                      id="lastMeeting"
                      value={formData.lastMeeting}
                      onChange={(value) => setFormData({ ...formData, lastMeeting: value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>
                  </div>
                </div>

                {/* Sector 3: Contato */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Contato</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Informações de contato e localização</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="login" className="text-slate-700 dark:text-gray-300">
                      Login <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="login"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                      placeholder="Nome de usuário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-gray-300">
                      E-mail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-slate-700 dark:text-gray-300">
                      Telefone / WhatsApp
                    </Label>
                    <PhoneInput
                      id="contact"
                      value={formData.contact}
                      onChange={(value) => setFormData({ ...formData, contact: value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-slate-700 dark:text-gray-300">
                      Endereço Completo
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                      placeholder="Rua, número, complemento, bairro"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-700 dark:text-gray-300">
                      País
                    </Label>
                    <Select
                      value={formData.countryId}
                      onValueChange={handleCountryChange}
                      disabled={saving || loadingCountries}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder={loadingCountries ? "Carregando..." : "Selecione um país"} />
                      </SelectTrigger>
                      <SelectContent searchable className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600" searchPlaceholder="Buscar país...">
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id} className="text-slate-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-700 dark:text-gray-300">
                      Estado (UF)
                    </Label>
                    <Select
                      value={formData.stateId}
                      onValueChange={handleStateChange}
                      disabled={saving || loadingStates || !formData.countryId}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder={loadingStates ? "Carregando..." : !formData.countryId ? "Selecione um país primeiro" : "Selecione um estado"} />
                      </SelectTrigger>
                      <SelectContent searchable className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600" searchPlaceholder="Buscar estado...">
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id} className="text-slate-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700 dark:text-gray-300">
                      Cidade
                    </Label>
                    <Select
                      value={formData.cityId}
                      onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                      disabled={saving || loadingCities || !formData.stateId}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder={loadingCities ? "Carregando..." : !formData.stateId ? "Selecione um estado primeiro" : "Selecione uma cidade"} />
                      </SelectTrigger>
                      <SelectContent searchable className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600" searchPlaceholder="Buscar cidade...">
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id} className="text-slate-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-slate-700 dark:text-gray-300">
                      Status de Acesso
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                        <SelectItem value="active" className="text-slate-800 dark:text-white">Ativo</SelectItem>
                        <SelectItem value="inactive" className="text-slate-800 dark:text-white">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                </div>

                {/* Sector 4: Prospecção e Origem */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Prospecção e Origem</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Origem e informações profissionais</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prospectionOrigin" className="text-slate-700 dark:text-gray-300">
                      Origem da Prospecção
                    </Label>
                    <Select
                      value={formData.prospectionOrigin || 'none'}
                      onValueChange={(value: string) => setFormData({ ...formData, prospectionOrigin: value === 'none' ? '' : value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600">
                        <SelectItem value="none" className="text-slate-800 dark:text-white">Nenhum</SelectItem>
                        <SelectItem value="Indicação" className="text-slate-800 dark:text-white">Indicação</SelectItem>
                        <SelectItem value="Instagram" className="text-slate-800 dark:text-white">Instagram</SelectItem>
                        <SelectItem value="Site" className="text-slate-800 dark:text-white">Site</SelectItem>
                        <SelectItem value="Eventos" className="text-slate-800 dark:text-white">Eventos</SelectItem>
                        <SelectItem value="Outro" className="text-slate-800 dark:text-white">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession" className="text-slate-700 dark:text-gray-300">
                      Profissão / Atividade
                    </Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                      placeholder="Ex: Médico, Empresário, Autônomo"
                    />
                  </div>

                  <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                      Informações Automáticas
                    </h3>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-gray-400">
                      <p><strong>Data de Cadastro:</strong> {client?.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                      <p><strong>Última Atualização:</strong> {client?.updatedAt ? new Date(client.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Password Change Info Box */}
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Para alterar a senha do cliente, ele deve usar a opção &quot;Esqueci minha senha&quot; na tela de login.
                  </p>
                </div>
              </TabsContent>

              {/* Tab: Patrimônio */}
              <TabsContent value="patrimonio" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-slate-600 dark:text-gray-400 text-center">
                    A funcionalidade de Patrimônio será implementada em breve.
                  </p>
                </div>
              </TabsContent>

              {/* Tab: Planejamento Financeiro */}
              <TabsContent value="planejamento" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-slate-600 dark:text-gray-400 text-center">
                    A funcionalidade de Planejamento Financeiro será implementada em breve.
                  </p>
                </div>
              </TabsContent>

              {/* Tab: Perfil de Investidor */}
              <TabsContent value="perfil-investidor" className="space-y-4">
                {loadingQuestionnaire ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#B4F481]" />
                  </div>
                ) : showNewQuestionnaire ? (
                  // Admin questionnaire form
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Novo Questionário - Perfil de Investidor
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewQuestionnaire(false);
                          setCurrentQuestionIndex(0);
                          setResponses(new Map());
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>

                    {questions.length > 0 && (
                      <div className="space-y-6">
                        {/* Progress indicator */}
                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-gray-400">
                          <span>
                            Questão {currentQuestionIndex + 1} de {questions.length}
                          </span>
                          <span>
                            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% concluído
                          </span>
                        </div>

                        {/* Question */}
                        <div className="bg-slate-50 dark:bg-[#0A1E33] p-6 rounded-lg">
                          <h4 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                            {questions[currentQuestionIndex]?.questionText}
                          </h4>

                          <RadioGroup
                            value={responses.get(questions[currentQuestionIndex]?.id) || ''}
                            onValueChange={(value) => {
                              const newResponses = new Map(responses);
                              newResponses.set(questions[currentQuestionIndex].id, value);
                              setResponses(newResponses);
                            }}
                          >
                            {questions[currentQuestionIndex]?.answers.map((answer: any) => (
                              <div key={answer.id} className="flex items-center space-x-2 mb-3">
                                <RadioGroupItem value={answer.id} id={answer.id} />
                                <Label
                                  htmlFor={answer.id}
                                  className="text-slate-700 dark:text-gray-300 cursor-pointer flex-1"
                                >
                                  {answer.answerText}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex justify-between pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                            disabled={currentQuestionIndex === 0}
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Anterior
                          </Button>

                          {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                              type="button"
                              onClick={handleSubmitQuestionnaire}
                              disabled={responses.size !== questions.length}
                              className="bg-[#B4F481] hover:bg-[#a3e070] text-slate-900"
                            >
                              Finalizar Questionário
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                              disabled={!responses.has(questions[currentQuestionIndex]?.id)}
                            >
                              Próxima
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Display latest questionnaire
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Perfil de Investidor
                      </h3>
                      <Button
                        type="button"
                        onClick={handleStartNewQuestionnaire}
                        className="bg-[#B4F481] hover:bg-[#a3e070] text-slate-900"
                      >
                        Realizar Novo Questionário
                      </Button>
                    </div>

                    {latestQuestionnaire ? (
                      <div className="space-y-4">
                        {/* Profile summary */}
                        <div className={`p-6 rounded-lg ${getRiskProfileColor(latestQuestionnaire.riskProfile)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                              Perfil: {latestQuestionnaire.riskProfile}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {new Date(latestQuestionnaire.completedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-gray-300">
                            {getRiskProfileDescription(latestQuestionnaire.riskProfile)}
                          </p>
                          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-gray-600">
                            <div className="flex gap-6 text-sm">
                              <div>
                                <span className="text-slate-600 dark:text-gray-400">Pontuação Total: </span>
                                <span className="font-semibold text-slate-800 dark:text-white">
                                  {latestQuestionnaire.totalWeight}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600 dark:text-gray-400">Média: </span>
                                <span className="font-semibold text-slate-800 dark:text-white">
                                  {latestQuestionnaire.averageWeight.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Questions and answers */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-slate-800 dark:text-white">
                            Respostas do Questionário:
                          </h5>
                          {latestQuestionnaire.responses.map((response: any, index: number) => (
                            <div
                              key={response.id}
                              className="bg-slate-50 dark:bg-[#0A1E33] p-4 rounded-lg"
                            >
                              <p className="font-medium text-slate-800 dark:text-white mb-2">
                                {index + 1}. {response.question}
                              </p>
                              <p className="text-slate-600 dark:text-gray-400 pl-4">
                                → {response.answer}
                                <span className="ml-2 text-xs text-slate-500 dark:text-gray-500">
                                  (Peso: {response.weight})
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-[#0A1E33] rounded-lg">
                        <AlertCircle className="w-12 h-12 text-slate-400 dark:text-gray-500 mb-4" />
                        <p className="text-slate-600 dark:text-gray-400 text-center mb-4">
                          Este cliente ainda não possui um perfil de investidor cadastrado.
                        </p>
                        <p className="text-sm text-slate-500 dark:text-gray-500 text-center mb-6">
                          Realize o questionário para determinar o perfil de investidor do cliente.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/clientes')}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
