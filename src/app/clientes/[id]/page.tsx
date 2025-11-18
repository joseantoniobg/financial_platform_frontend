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
import { PageTitle } from '@/components/ui/page-title';
import { SessionTitle } from '@/components/ui/session-title';
import { FormField } from '@/components/ui/form-field';
import { StSelect } from '@/components/st-select';
import { ClientBasicData } from '@/components/ClientBasicData';

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
  userNumber: number;
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
  // PLD Risk fields
  pldRiskScore?: number;
  pldRiskClassification?: string;
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
  const [maritalStatuses, setMaritalStatuses] = useState<{ id: string; name: string }[]>([]);
  const [loadingMaritalStatuses, setLoadingMaritalStatuses] = useState(false);
  const [dependents, setDependents] = useState<Array<{
    id?: string;
    name: string;
    sex: 'Masculino' | 'Feminino';
    birthDate: string;
    relation: string;
  }>>([]);
  
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
  const [isConsultant, setIsConsultant] = useState(false);

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
    // Marital Status
    maritalStatusId: '' as string,
    spouseName: '' as string,
    // Additional Client Information
    hasLifeInsurance: false as boolean,
    hasPrivatePension: false as boolean,
    // Conformidade - PLD/CPFT + PEP
    isPublicPosition: false as boolean,
    isRelatedToPEP: false as boolean,
    pepName: '' as string,
    pepRole: '' as string,
    pepEntity: '' as string,
    pepCountry: '' as string,
    pepStartDate: '' as string,
    pepEndDate: '' as string,
    isBeneficialOwner: false as boolean,
    resourceOrigin: '' as string,
    internationalTransactions: false as boolean,
    pldDeclarationAccepted: false as boolean,
    pldDeclarationDate: '' as string,
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
          // Marital Status
          maritalStatusId: data.maritalStatus?.id || '',
          spouseName: data.spouseName || '',
          // Additional Client Information
          hasLifeInsurance: data.hasLifeInsurance || false,
          hasPrivatePension: data.hasPrivatePension || false,
          // Conformidade
          isPublicPosition: data.isPublicPosition || false,
          isRelatedToPEP: data.isRelatedToPEP || false,
          pepName: data.pepName || '',
          pepRole: data.pepRole || '',
          pepEntity: data.pepEntity || '',
          pepCountry: data.pepCountry || '',
          pepStartDate: data.pepStartDate || '',
          pepEndDate: data.pepEndDate || '',
          isBeneficialOwner: data.isBeneficialOwner || false,
          resourceOrigin: data.resourceOrigin || '',
          internationalTransactions: data.internationalTransactions || false,
          pldDeclarationAccepted: data.pldDeclarationAccepted || false,
          pldDeclarationDate: data.pldDeclarationDate || '',
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

  const fetchDependents = async () => {
    try {
      const res = await fetch(`/api/dependents/user/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setDependents(data);
      }
    } catch (error) {
      console.error('Error fetching dependents:', error);
    }
  };

  const handleAddDependent = async (dependent: typeof dependents[0]) => {
    try {
      const res = await fetch(`/api/dependents/user/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dependent),
      });

      if (res.ok) {
        toast.success('Dependente adicionado com sucesso!');
        await fetchDependents();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao adicionar dependente');
      }
    } catch (error) {
      toast.error('Erro ao adicionar dependente');
    }
  };

  const handleUpdateDependent = async (id: string, dependent: typeof dependents[0]) => {
    try {
      const res = await fetch(`/api/dependents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dependent),
      });

      if (res.ok) {
        toast.success('Dependente atualizado com sucesso!');
        await fetchDependents();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao atualizar dependente');
      }
    } catch (error) {
      toast.error('Erro ao atualizar dependente');
    }
  };

  const handleDeleteDependent = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este dependente?')) {
      return;
    }

    try {
      const res = await fetch(`/api/dependents/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Dependente removido com sucesso!');
        await fetchDependents();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao remover dependente');
      }
    } catch (error) {
      toast.error('Erro ao remover dependente');
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
      const res = await fetch('/api/users?limit=1000&isConsultant=true');
      if (res.ok) {
        const data = await res.json();
        setConsultants(data.users.map((u: any) => ({ id: u.id, name: u.name })));
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

  const fetchMaritalStatuses = useCallback(async () => {
    setLoadingMaritalStatuses(true);
    try {
      const res = await fetch('/api/marital-status');
      if (res.ok) {
        const data = await res.json();
        setMaritalStatuses(data);
      }
    } catch (error) {
      console.error('Error fetching marital statuses:', error);
    } finally {
      setLoadingMaritalStatuses(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClient();
      fetchCategories();
      fetchCountries();
      fetchConsultants();
      fetchMaritalStatuses();
      fetchDependents();
    }
  }, [isAuthenticated, clientId]);

  useEffect(() => {
    if (user && user.roles.some(r => r.name === 'Consultor')) {
      setFormData(prev => ({
        ...prev,
        consultantId: user.sub,
      }));
      setIsConsultant(true);
    }
  }, [user, consultants]);

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

      // Marital Status fields
      if (formData.maritalStatusId) {
        payload.maritalStatusId = formData.maritalStatusId;
      }

      if (formData.spouseName) {
        payload.spouseName = formData.spouseName;
      }

      // Additional Client Information
      payload.hasLifeInsurance = !!formData.hasLifeInsurance;
      payload.hasPrivatePension = !!formData.hasPrivatePension;

      // Conformidade fields
      payload.isPublicPosition = !!formData.isPublicPosition;
      payload.isRelatedToPEP = !!formData.isRelatedToPEP;
      if (formData.pepName) payload.pepName = formData.pepName;
      if (formData.pepRole) payload.pepRole = formData.pepRole;
      if (formData.pepEntity) payload.pepEntity = formData.pepEntity;
      if (formData.pepCountry) payload.pepCountry = formData.pepCountry;
      if (formData.pepStartDate) payload.pepStartDate = formData.pepStartDate;
      if (formData.pepEndDate) payload.pepEndDate = formData.pepEndDate;
      payload.isBeneficialOwner = !!formData.isBeneficialOwner;
      if (formData.resourceOrigin) payload.resourceOrigin = formData.resourceOrigin;
      payload.internationalTransactions = !!formData.internationalTransactions;
      payload.pldDeclarationAccepted = !!formData.pldDeclarationAccepted;
      if (formData.pldDeclarationDate) payload.pldDeclarationDate = formData.pldDeclarationDate;

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

  const isAdmin = user.roles?.some(role => ['Administrador', 'Consultor'].includes(role.name));
  
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
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--card))]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/clientes')}
            variant="outline"
            size="icon"
            className="p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-8 w-8 text-[hsl(var(--foreground))]" />
          </Button>
          <PageTitle title="Editar Cliente" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-[hsl(var(--card))] rounded-lg shadow-md border border-[hsl(var(--app-border))] p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="dados-cadastrais">Dados Cadastrais</TabsTrigger>
                <TabsTrigger value="perfil-investidor">Perfil & Suitability</TabsTrigger>
                <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
                <TabsTrigger value="planejamento">Planejamento Financeiro</TabsTrigger>
              </TabsList>

              {/* Tab: Dados Cadastrais - Contains all 4 sectors */}
              <ClientBasicData formData={formData} setFormData={setFormData} saving={saving}
                countries={countries} states={states} cities={cities}
                loadingCountries={loadingCountries} loadingStates={loadingStates} loadingCities={loadingCities}
                handleCountryChange={handleCountryChange} handleStateChange={handleStateChange}
                categories={categories} consultants={consultants}
                isConsultant={isConsultant}
                client={client}
                maritalStatuses={maritalStatuses}
                loadingMaritalStatuses={loadingMaritalStatuses}
                dependents={dependents}
                onAddDependent={handleAddDependent}
                onUpdateDependent={handleUpdateDependent}
                onDeleteDependent={handleDeleteDependent}
              />

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
                    <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--foreground))]" />
                  </div>
                ) : showNewQuestionnaire ? (
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
                        <div className="bg-[hsl(var(--card))] p-6 rounded-lg">
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
                              className="bg-[hsl(var(--primary)] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))]"
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
                        className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--foreground))]"
                      >
                        Realizar Novo Questionário
                      </Button>
                    </div>

                    {latestQuestionnaire && latestQuestionnaire.riskProfile !== 'Nenhum' ? (
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


                    {/* Conformidade Section */}
                    <div className="mt-6 p-6 bg-[hsl(var(--card-accent))] rounded-lg border border-[hsl(var(--app-border))]">
                      <div className="pb-2 border-b border-gray-100 dark:border-gray-800 mb-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Conformidade (PLD/CPFT + PEP)</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">Informações de conformidade e PEP</p>
                      </div>

                      {client?.pldRiskClassification && (
                        <div className={`mb-4 p-4 rounded-lg border-2 ${
                          client.pldRiskClassification === 'Alto' 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                            : client.pldRiskClassification === 'Médio'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-slate-600 dark:text-gray-400">
                                Classificação de Risco PLD
                              </h5>
                              <p className={`text-xl font-bold mt-1 ${
                                client.pldRiskClassification === 'Alto' 
                                  ? 'text-red-700 dark:text-red-400' 
                                  : client.pldRiskClassification === 'Médio'
                                  ? 'text-yellow-700 dark:text-yellow-400'
                                  : 'text-green-700 dark:text-green-400'
                              }`}>
                                {client.pldRiskClassification}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[hsl(var(--foreground-muted))]">Pontuação</p>
                              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                {client.pldRiskScore || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-gray-300">Você ocupa ou foi ocupante de cargo público relevante?</Label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="isPublicPosition"
                                checked={!!formData.isPublicPosition}
                                onChange={() => setFormData({ ...formData, isPublicPosition: true })}
                              />
                              <span className="text-slate-700 dark:text-gray-300">Sim</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="isPublicPosition"
                                checked={!formData.isPublicPosition}
                                onChange={() => setFormData({ ...formData, isPublicPosition: false })}
                              />
                              <span className="text-slate-700 dark:text-gray-300">Não</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-gray-300">É cônjuge / parente / sócio de PEP?</Label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="isRelatedToPEP"
                                checked={!!formData.isRelatedToPEP}
                                onChange={() => setFormData({ ...formData, isRelatedToPEP: true })}
                              />
                              <span className="text-slate-700 dark:text-gray-300">Sim</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="isRelatedToPEP"
                                checked={!formData.isRelatedToPEP}
                                onChange={() => setFormData({ ...formData, isRelatedToPEP: false })}
                              />
                              <span className="text-slate-700 dark:text-gray-300">Não</span>
                            </label>
                          </div>
                        </div>

                      {/* PEP details - shown if any of the two above is true */}
                      {(formData.isPublicPosition || formData.isRelatedToPEP) && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">Nome da pessoa exposta</Label>
                            <Input value={formData.pepName} onChange={(e) => setFormData({ ...formData, pepName: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">Cargo/Função</Label>
                            <Input value={formData.pepRole} onChange={(e) => setFormData({ ...formData, pepRole: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">Órgão/Entidade</Label>
                            <Input value={formData.pepEntity} onChange={(e) => setFormData({ ...formData, pepEntity: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">País</Label>
                            <Input value={formData.pepCountry} onChange={(e) => setFormData({ ...formData, pepCountry: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">Data início</Label>
                            <DateInput value={formData.pepStartDate} onChange={(value) => setFormData({ ...formData, pepStartDate: value })} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">Data término (se aplicável)</Label>
                            <DateInput value={formData.pepEndDate} onChange={(value) => setFormData({ ...formData, pepEndDate: value })} />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Você é o proprietário real dos recursos?</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" name="isBeneficialOwner" checked={!!formData.isBeneficialOwner} onChange={() => setFormData({ ...formData, isBeneficialOwner: true })} />
                            <span className="text-slate-700 dark:text-gray-300">Sim</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="isBeneficialOwner" checked={!formData.isBeneficialOwner} onChange={() => setFormData({ ...formData, isBeneficialOwner: false })} />
                            <span className="text-slate-700 dark:text-gray-300">Não</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-700 dark:text-gray-300">Origem dos recursos</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {['Salário / Rendimento próprio', 'Lucros / Dividendos', 'Venda de bens', 'Herança / Doações', 'Outros'].map(opt => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="resourceOrigin"
                                checked={formData.resourceOrigin === opt}
                                onChange={() => setFormData({ ...formData, resourceOrigin: opt === 'Outros' ? '' : opt })}
                              />
                              <span className="text-slate-700 dark:text-gray-300">{opt}</span>
                            </label>
                          ))}
                        </div>
                        {!( ['Salário / Rendimento próprio', 'Lucros / Dividendos', 'Venda de bens', 'Herança / Doações'].includes(formData.resourceOrigin)) && (
                          <div className="mt-2">
                            <Input placeholder="Descreva a origem dos recursos" value={formData.resourceOrigin} onChange={(e) => setFormData({ ...formData, resourceOrigin: e.target.value })} />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Transações internacionais</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" name="internationalTransactions" checked={!!formData.internationalTransactions} onChange={() => setFormData({ ...formData, internationalTransactions: true })} />
                            <span className="text-slate-700 dark:text-gray-300">Sim</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="internationalTransactions" checked={!formData.internationalTransactions} onChange={() => setFormData({ ...formData, internationalTransactions: false })} />
                            <span className="text-slate-700 dark:text-gray-300">Não</span>
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-2">
                        <label className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={!!formData.pldDeclarationAccepted}
                            onChange={(e) => {
                              const accepted = e.target.checked;
                              setFormData({ ...formData, pldDeclarationAccepted: accepted, pldDeclarationDate: accepted ? new Date().toISOString() : '' });
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/clientes')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
