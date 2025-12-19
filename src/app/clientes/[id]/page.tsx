'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Save, TrendingUp, Calendar, ChevronLeft, ChevronRight, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DateInput } from '@/components/ui/date-input';
import { PageTitle } from '@/components/ui/page-title';
import { ClientBasicData } from '@/components/ClientBasicData';
import { PatrimonySection } from '@/components/PatrimonySection';
import { FinancialGoalsSection } from '@/components/FinancialGoalsSection';
import { MonthlyBudgetsSection } from '@/components/MonthlyBudgetsSection';
import { StLoading } from '@/components/StLoading';
import Schedulings from '@/components/Schedulings';
import { StSelect } from '@/components/st-select';
import { FormField } from '@/components/ui/form-field';

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

interface Property {
  id: string;
  propertyType: string;
  address: string;
  marketValue: number;
  lastAppraisalDate?: string;
  isFinanced: boolean;
  notes?: string;
}

interface Vehicle {
  id: string;
  vehicleType: string;
  model: string;
  year?: number;
  estimatedValue: number;
  notes?: string;
}

interface ValuableAsset {
  id: string;
  description: string;
  category: string;
  estimatedValue: number;
  notes?: string;
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  startDate: string;
  targetDate: string;
  expectedReturnRate: number;
  monthlyContribution: number;
  notes?: string;
}

export interface Category {
  id: string;
  category: string;
  defaultDirection: 'Entrada' | 'Saída' | 'Investimento';
  parentId?: string;
}

export interface UserTransactionType {
  id: string;
  type: string;
  direction: 'Entrada' | 'Saída' | 'Investimento' | 'Aporte' | 'Resgate';
  category: Category;
}

export interface MonthlyBudget {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  budgetType: 'teto' | 'piso';
  amount: number;
  category: Category;
  subcategory?: UserTransactionType;
}

interface Question {
  id: string;
  questionText: string;
  options: Array<{ id: string; answerText: string; value: string }>;
}

interface Questionnaire {
  id: string;
  riskProfile: string;
  completedAt: string;
  totalWeight: number;
  averageWeight: number;
  responses: { id: string; question: string; answer: string; weight: number }[];
}

interface Service {
  id: string;
  service: string;
  isActive: boolean;
  pricings: Array<{ price: number; }>;
}

interface ClientSubscription {
  id: string;
  clientId: string;
  serviceId: string;
  service: Service;
  recurrenceType: 'Único' | 'Mensal';
  dueDay: number;
  amount?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  canceledAt?: string;
}

export default function EditClientPage({ searchParams }: { searchParams: Promise<{ module?: string | undefined }> }) {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const { module } = use(searchParams);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState(module || 'dados-cadastrais');
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

  useEffect(() => {
    setActiveTab(module || 'dados-cadastrais');
  }, [module]);
  
  // Patrimony state
  const [properties, setProperties] = useState<Property[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [valuableAssets, setValuableAssets] = useState<ValuableAsset[]>([]);
  const [loadingPatrimony, setLoadingPatrimony] = useState(false);
  
  // Patrimony form states
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propertyForm, setPropertyForm] = useState({
    propertyType: '',
    address: '',
    marketValue: '',
    lastAppraisalDate: '',
    isFinanced: false,
    notes: ''
  });
  
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicleType: '',
    model: '',
    year: '',
    estimatedValue: '',
    notes: ''
  });
  
  const [showValuableAssetForm, setShowValuableAssetForm] = useState(false);
  const [editingValuableAssetId, setEditingValuableAssetId] = useState<string | null>(null);
  const [valuableAssetForm, setValuableAssetForm] = useState({
    description: '',
    category: '',
    estimatedValue: '',
    notes: ''
  });
  
  // Financial Goals state
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [loadingFinancialGoals, setLoadingFinancialGoals] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    startDate: '',
    targetDate: '',
    expectedReturnRate: '1.0',
    notes: ''
  });
  
  // Monthly Budgets state
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
  const [loadingMonthlyBudgets, setLoadingMonthlyBudgets] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    categoryId: '',
    subcategoryId: '',
    budgetType: 'teto' as 'teto' | 'piso',
    amount: ''
  });
  
  // Investor Profile state
  const [latestQuestionnaire, setLatestQuestionnaire] = useState<Questionnaire | null>(null);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [showNewQuestionnaire, setShowNewQuestionnaire] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, string>>(new Map());

  // Client Subscriptions state
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<string | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    serviceId: '',
    recurrenceType: 'Mensal' as 'Único' | 'Mensal',
    dueDay: '1',
    amount: '',
    notes: ''
  });
  const [services, setServices] = useState<Service[]>([]);

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

  // Patrimony Handlers - Properties
  const handleAddProperty = () => {
    setEditingPropertyId(null);
    setPropertyForm({
      propertyType: '',
      address: '',
      marketValue: '',
      lastAppraisalDate: '',
      isFinanced: false,
      notes: ''
    });
    setShowPropertyForm(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingPropertyId(property.id);
    setPropertyForm({
      propertyType: property.propertyType,
      address: property.address,
      marketValue: property.marketValue.toString(),
      lastAppraisalDate: property.lastAppraisalDate || '',
      isFinanced: property.isFinanced,
      notes: property.notes || ''
    });
    setShowPropertyForm(true);
  };

  const handleSaveProperty = async () => {
    if (!propertyForm.propertyType || !propertyForm.address || !propertyForm.marketValue) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const payload = {
        propertyType: propertyForm.propertyType,
        address: propertyForm.address,
        marketValue: parseFloat(propertyForm.marketValue),
        lastAppraisalDate: propertyForm.lastAppraisalDate || undefined,
        isFinanced: propertyForm.isFinanced,
        notes: propertyForm.notes || undefined
      };

      const url = editingPropertyId 
        ? `/api/patrimony/properties/${editingPropertyId}`
        : `/api/patrimony/properties/user/${clientId}`;
      
      const method = editingPropertyId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingPropertyId ? 'Imóvel atualizado com sucesso!' : 'Imóvel adicionado com sucesso!');
        await fetchPatrimony();
        setShowPropertyForm(false);
        setEditingPropertyId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar imóvel');
      }
    } catch (error) {
      toast.error('Erro ao salvar imóvel');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este imóvel?')) {
      return;
    }

    try {
      const res = await fetch(`/api/patrimony/properties/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Imóvel removido com sucesso!');
        await fetchPatrimony();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao remover imóvel');
      }
    } catch (error) {
      toast.error('Erro ao remover imóvel');
    }
  };

  // Patrimony Handlers - Vehicles
  const handleAddVehicle = () => {
    setEditingVehicleId(null);
    setVehicleForm({
      vehicleType: '',
      model: '',
      year: '',
      estimatedValue: '',
      notes: ''
    });
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      vehicleType: vehicle.vehicleType,
      model: vehicle.model,
      year: vehicle.year?.toString() || '',
      estimatedValue: vehicle.estimatedValue.toString(),
      notes: vehicle.notes || ''
    });
    setShowVehicleForm(true);
  };

  const handleSaveVehicle = async () => {
    if (!vehicleForm.vehicleType || !vehicleForm.model || !vehicleForm.estimatedValue) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const payload = {
        vehicleType: vehicleForm.vehicleType,
        model: vehicleForm.model,
        year: vehicleForm.year ? parseInt(vehicleForm.year) : undefined,
        estimatedValue: parseFloat(vehicleForm.estimatedValue),
        notes: vehicleForm.notes || undefined
      };

      const url = editingVehicleId 
        ? `/api/patrimony/vehicles/${editingVehicleId}`
        : `/api/patrimony/vehicles/user/${clientId}`;
      
      const method = editingVehicleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingVehicleId ? 'Veículo atualizado com sucesso!' : 'Veículo adicionado com sucesso!');
        await fetchPatrimony();
        setShowVehicleForm(false);
        setEditingVehicleId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar veículo');
      }
    } catch (error) {
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este veículo?')) {
      return;
    }

    try {
      const res = await fetch(`/api/patrimony/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Veículo removido com sucesso!');
        await fetchPatrimony();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao remover veículo');
      }
    } catch (error) {
      toast.error('Erro ao remover veículo');
    }
  };

  // Patrimony Handlers - Valuable Assets
  const handleAddValuableAsset = () => {
    setEditingValuableAssetId(null);
    setValuableAssetForm({
      description: '',
      category: '',
      estimatedValue: '',
      notes: ''
    });
    setShowValuableAssetForm(true);
  };

  const handleEditValuableAsset = (asset: ValuableAsset) => {
    setEditingValuableAssetId(asset.id);
    setValuableAssetForm({
      description: asset.description,
      category: asset.category,
      estimatedValue: asset.estimatedValue.toString(),
      notes: asset.notes || ''
    });
    setShowValuableAssetForm(true);
  };

  const handleSaveValuableAsset = async () => {
    if (!valuableAssetForm.description || !valuableAssetForm.category || !valuableAssetForm.estimatedValue) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const payload = {
        description: valuableAssetForm.description,
        category: valuableAssetForm.category,
        estimatedValue: parseFloat(valuableAssetForm.estimatedValue),
        notes: valuableAssetForm.notes || undefined
      };

      const url = editingValuableAssetId 
        ? `/api/patrimony/valuable-assets/${editingValuableAssetId}`
        : `/api/patrimony/valuable-assets/user/${clientId}`;
      
      const method = editingValuableAssetId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingValuableAssetId ? 'Bem de valor atualizado com sucesso!' : 'Bem de valor adicionado com sucesso!');
        await fetchPatrimony();
        setShowValuableAssetForm(false);
        setEditingValuableAssetId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar bem de valor');
      }
    } catch (error) {
      toast.error('Erro ao salvar bem de valor');
    }
  };

  const handleDeleteValuableAsset = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este bem de valor?')) {
      return;
    }

    try {
      const res = await fetch(`/api/patrimony/valuable-assets/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Bem de valor removido com sucesso!');
        await fetchPatrimony();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao remover bem de valor');
      }
    } catch (error) {
      toast.error('Erro ao remover bem de valor');
    }
  };

  const handleCancelPropertyForm = () => {
    setShowPropertyForm(false);
    setEditingPropertyId(null);
  };

  const handleCancelVehicleForm = () => {
    setShowVehicleForm(false);
    setEditingVehicleId(null);
  };

  const handleCancelValuableAssetForm = () => {
    setShowValuableAssetForm(false);
    setEditingValuableAssetId(null);
  };

  const handleAddSubscription = () => {
    setEditingSubscriptionId(null);
    setSubscriptionForm({
      serviceId: '',
      recurrenceType: 'Mensal',
      dueDay: '1',
      amount: '',
      notes: ''
    });
    setShowSubscriptionForm(true);
  };

  const handleCancelSubscription = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return;

    try {
      const res = await fetch(`/api/client-subscriptions/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Assinatura cancelada!');
        await fetchSubscriptions();
      } else {
        toast.error('Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
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
        setConsultants(data.users.map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })));
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

  const fetchPatrimony = useCallback(async () => {
    if (!clientId) return;
    setLoadingPatrimony(true);
    try {
      const res = await fetch(`/api/patrimony/user/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
        setVehicles(data.vehicles || []);
        setValuableAssets(data.valuableAssets || []);
      }
    } catch (error) {
      console.error('Error fetching patrimony:', error);
    } finally {
      setLoadingPatrimony(false);
    }
  }, [clientId]);

  // Financial Goals Handlers
  const fetchFinancialGoals = useCallback(async () => {
    if (!clientId) return;
    setLoadingFinancialGoals(true);
    try {
      const res = await fetch(`/api/financial-goals/user/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setFinancialGoals(data || []);
      }
    } catch (error) {
      console.error('Error fetching financial goals:', error);
    } finally {
      setLoadingFinancialGoals(false);
    }
  }, [clientId]);

  const handleAddGoal = () => {
    setEditingGoalId(null);
    setGoalForm({
      title: '',
      targetAmount: '',
      startDate: '',
      targetDate: '',
      expectedReturnRate: '1.0',
      notes: ''
    });
    setShowGoalForm(true);
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      expectedReturnRate: goal.expectedReturnRate.toString(),
      notes: goal.notes || ''
    });
    setShowGoalForm(true);
  };

  const handleSaveGoal = async () => {
    if (!goalForm.title || !goalForm.targetAmount || !goalForm.startDate || !goalForm.targetDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const payload = {
        title: goalForm.title,
        targetAmount: parseFloat(goalForm.targetAmount),
        startDate: goalForm.startDate,
        targetDate: goalForm.targetDate,
        expectedReturnRate: parseFloat(goalForm.expectedReturnRate),
        notes: goalForm.notes || undefined
      };

      const url = editingGoalId 
        ? `/api/financial-goals/${editingGoalId}`
        : `/api/financial-goals/user/${clientId}`;
      
      const method = editingGoalId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingGoalId ? 'Objetivo atualizado com sucesso!' : 'Objetivo adicionado com sucesso!');
        await fetchFinancialGoals();
        setShowGoalForm(false);
        setEditingGoalId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar objetivo');
      }
    } catch (error) {
      toast.error('Erro ao salvar objetivo');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este objetivo financeiro?')) {
      return;
    }

    try {
      const res = await fetch(`/api/financial-goals/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Objetivo removido com sucesso!');
        await fetchFinancialGoals();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao remover objetivo');
      }
    } catch (error) {
      toast.error('Erro ao remover objetivo');
    }
  };

  const handleCancelGoalForm = () => {
    setShowGoalForm(false);
    setEditingGoalId(null);
  };

  // Monthly Budgets Handlers
  const fetchMonthlyBudgets = useCallback(async () => {
    if (!clientId) return;
    setLoadingMonthlyBudgets(true);
    try {
      const res = await fetch(`/api/monthly-budgets/user/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyBudgets(data || []);
      }
    } catch (error) {
      console.error('Error fetching monthly budgets:', error);
    } finally {
      setLoadingMonthlyBudgets(false);
    }
  }, [clientId]);

  const handleAddBudget = () => {
    setEditingBudgetId(null);
    setBudgetForm({
      categoryId: '',
      subcategoryId: '',
      budgetType: 'teto',
      amount: ''
    });
    setShowBudgetForm(curr => !curr);
  };

  const handleEditBudget = (budget: MonthlyBudget) => {
    setEditingBudgetId(budget.id);
    setBudgetForm({
      categoryId: budget.categoryId,
      subcategoryId: budget.subcategoryId || '',
      budgetType: budget.budgetType,
      amount: budget.amount.toString()
    });
    setShowBudgetForm(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetForm.categoryId || !budgetForm.amount) {
      toast.error('Preencha a categoria e o valor');
      return;
    }

    try {
      const payload = {
        categoryId: budgetForm.categoryId,
        subcategoryId: budgetForm.subcategoryId || undefined,
        budgetType: budgetForm.budgetType,
        amount: parseFloat(budgetForm.amount)
      };

      const url = editingBudgetId 
        ? `/api/monthly-budgets/${editingBudgetId}`
        : `/api/monthly-budgets/user/${clientId}`;
      
      const method = editingBudgetId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingBudgetId ? 'Teto/Piso atualizado com sucesso!' : 'Teto/Piso adicionado com sucesso!');
        await fetchMonthlyBudgets();
        setShowBudgetForm(false);
        setEditingBudgetId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar teto/piso');
      }
    } catch (error) {
      toast.error('Erro ao salvar teto/piso');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este teto/piso?')) {
      return;
    }

    try {
      const res = await fetch(`/api/monthly-budgets/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Teto/Piso removido com sucesso!');
        await fetchMonthlyBudgets();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao remover teto/piso');
      }
    } catch (error) {
      toast.error('Erro ao remover teto/piso');
    }
  };

  const handleCancelBudgetForm = () => {
    setShowBudgetForm(false);
    setEditingBudgetId(null);
  };

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

  useEffect(() => {
    if (activeTab === 'patrimonio' && clientId) {
      fetchPatrimony();
    }
  }, [activeTab, clientId, fetchPatrimony]);

  useEffect(() => {
    if (activeTab === 'planejamento' && clientId) {
      fetchFinancialGoals();
      fetchMonthlyBudgets();
    }
  }, [activeTab, clientId, fetchFinancialGoals, fetchMonthlyBudgets]);

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
        router.push(isClient ? `/home` : '/clientes');
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

  // Client Subscriptions functions
  const fetchSubscriptions = useCallback(async () => {
    if (!clientId) return;
    
    setLoadingSubscriptions(true);
    try {
      const res = await fetch(`/api/client-subscriptions/client/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  }, [clientId]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.data.filter((s: Service) => s.isActive));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleEditSubscription = (subscription: ClientSubscription) => {
    setEditingSubscriptionId(subscription.id);
    setSubscriptionForm({
      serviceId: subscription.serviceId,
      recurrenceType: subscription.recurrenceType,
      dueDay: subscription.dueDay.toString(),
      amount: subscription.amount?.toString() || '',
      notes: subscription.notes || ''
    });
    setShowSubscriptionForm(true);
  };

  const handleSaveSubscription = async () => {
    if (!subscriptionForm.serviceId || !subscriptionForm.dueDay) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const payload = {
        clientId,
        serviceId: subscriptionForm.serviceId,
        recurrenceType: subscriptionForm.recurrenceType,
        dueDay: parseInt(subscriptionForm.dueDay),
        amount: subscriptionForm.amount ? parseFloat(subscriptionForm.amount) : undefined,
        notes: subscriptionForm.notes || undefined
      };

      const url = editingSubscriptionId
        ? `/api/client-subscriptions/${editingSubscriptionId}`
        : '/api/client-subscriptions';
      
      const method = editingSubscriptionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSubscriptionId ? { ...payload, clientId: undefined } : payload)
      });

      if (res.ok) {
        toast.success(editingSubscriptionId ? 'Assinatura atualizada!' : 'Assinatura criada!');
        setShowSubscriptionForm(false);
        await fetchSubscriptions();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar assinatura');
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error('Erro ao salvar assinatura');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta assinatura?')) return;

    try {
      const res = await fetch(`/api/client-subscriptions/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Assinatura removida!');
        await fetchSubscriptions();
      } else {
        toast.error('Erro ao remover assinatura');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Erro ao remover assinatura');
    }
  };

  const handleCancelSubscriptionForm = () => {
    setShowSubscriptionForm(false);
    setEditingSubscriptionId(null);
  };

  useEffect(() => {
    if (activeTab === 'assinaturas' && clientId) {
      fetchSubscriptions();
      fetchServices();
    }
  }, [activeTab, clientId, fetchSubscriptions]);

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

  // Effect to load patrimony when tab is active
  useEffect(() => {
    if (activeTab === 'patrimonio' && clientId) {
      fetchPatrimony();
    }
  }, [activeTab, clientId, fetchPatrimony]);

  if (!isAuthenticated || !user) return null;

  const isAdmin = user.roles?.some(role => ['Administrador', 'Consultor'].includes(role.name));
  const isClient = user.roles?.some(role => role.name === 'Cliente') && user.roles.length === 1;
  
  if (!isAdmin && !isClient || (isClient && (user.sub !== clientId || !module))) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Apenas administradores, consultores ou clientes podem acessar esta página.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StLoading loading={loading || loadingPatrimony}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {!isClient && <Button
              onClick={() => router.push('/clientes')}
              variant="outline"
              size="icon"
              className="p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-8 w-8 text-[hsl(var(--foreground))]" />
            </Button>}
            <PageTitle title={isClient ? module === 'planejamento' ? "Meus Objetivos" : module === 'dados-cadastrais' ? "Meus Dados" : "Meu Patrimônio" : "Editar Cliente"} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg border border-[hsl(var(--app-border))]/10 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {!isClient && <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="dados-cadastrais">Dados Cadastrais</TabsTrigger>
                  <TabsTrigger value="perfil-investidor">Perfil & Suitability</TabsTrigger>
                  <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
                  <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
                  <TabsTrigger value="assinaturas">Assinaturas & Pagamentos</TabsTrigger>
                  <TabsTrigger value="planejamento">Objetivos & Planejamento Financeiro</TabsTrigger>
                </TabsList>}

                {/* Tab: Dados Cadastrais - Contains all 4 sectors */}
                <ClientBasicData formData={formData} setFormData={setFormData} saving={saving}
                  countries={countries} states={states} cities={cities}
                  loadingCountries={loadingCountries} loadingStates={loadingStates} loadingCities={loadingCities}
                  handleCountryChange={handleCountryChange} handleStateChange={handleStateChange}
                  categories={categories} consultants={consultants}
                  isConsultant={isConsultant}
                  isClient={isClient && module !== undefined && !isConsultant}
                  client={client}
                  maritalStatuses={maritalStatuses}
                  loadingMaritalStatuses={loadingMaritalStatuses}
                  dependents={dependents}
                  onAddDependent={handleAddDependent}
                  onUpdateDependent={handleUpdateDependent}
                  onDeleteDependent={handleDeleteDependent}
                />

                <TabsContent value="agendamentos" className="space-y-6">
                  <Schedulings client={client} />
                </TabsContent>

                {/* Tab: Assinaturas & Pagamentos */}
                <TabsContent value="assinaturas" className="space-y-6">
                  {loadingSubscriptions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--nav-background))]" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                            Serviços Assinados
                          </h3>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                            Gerencie os serviços contratados e configure os pagamentos
                          </p>
                        </div>
                        <Button onClick={handleAddSubscription} className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Nova Assinatura
                        </Button>
                      </div>

                      {/* Subscriptions List */}
                      {subscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--app-border))]/10">
                          <Calendar className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
                          <p className="text-[hsl(var(--muted-foreground))]">
                            Nenhuma assinatura cadastrada
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {subscriptions.map((subscription) => (
                            <div
                              key={subscription.id}
                              className="bg-[hsl(var(--card-accent))] rounded-lg border border-[hsl(var(--app-border))]/10 p-6 space-y-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                                    {subscription.service.service}
                                  </h4>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                      <span className="font-medium">Recorrência:</span>{' '}
                                      {subscription.recurrenceType}
                                    </p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                      <span className="font-medium">Dia do Vencimento:</span>{' '}
                                      {subscription.dueDay}
                                    </p>
                                    {subscription.amount && (
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        <span className="font-medium">Valor:</span>{' '}
                                        {new Intl.NumberFormat('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL'
                                        }).format(subscription.amount)}
                                      </p>
                                    )}
                                    {subscription.notes && (
                                      <p className="text-sm text-[hsl(var(--muted-foreground))] italic mt-2">
                                        {subscription.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {subscription.isActive && (
                                  <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleEditSubscription(subscription)}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteSubscription(subscription.id)}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>)}
                              </div>
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                subscription.isActive 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                  : 'bg-red-600/60 text-red-100'
                              }`}>
                                {subscription.isActive ? 'Ativa' : 'Cancelada'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Subscription Form Modal */}
                      {showSubscriptionForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                          <div className="bg-[hsl(var(--card))] rounded-lg max-w-md w-full p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                                {editingSubscriptionId ? 'Editar Assinatura' : 'Nova Assinatura'}
                              </h3>
                              <Button
                                onClick={handleCancelSubscriptionForm}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                ✕
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <StSelect 
                                label="Serviço"
                                required
                                value={subscriptionForm.serviceId}
                                onChange={(e) =>
                                  setSubscriptionForm({ ...subscriptionForm, serviceId: `${e}`, amount: `${services.find(service => service.id === e)?.pricings[0]?.price || ''}` })
                                }
                                items={services.map((service) => ({
                                  id: service.id,
                                  description: service.service
                                }))}
                                htmlFor='service'
                                loading={false}
                                searchable={false}
                              />
                              

                              <div>
                                <StSelect
                                  label="Recorrência"
                                  required
                                  value={subscriptionForm.recurrenceType}
                                  onChange={(e) =>
                                    setSubscriptionForm({ 
                                      ...subscriptionForm, 
                                      recurrenceType: e as 'Único' | 'Mensal' 
                                    })
                                  }
                                  items={[
                                    { id: 'Mensal', description: 'Mensal' },
                                    { id: 'Único', description: 'Único' }
                                  ]}
                                  htmlFor='recurrenceType'
                                  loading={false}
                                  searchable={false}
                                />
                              </div>

                              <div>
                                <Label htmlFor="dueDay">Dia do Vencimento* (1-31)</Label>
                                <Input
                                  id="dueDay"
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={subscriptionForm.dueDay}
                                  onChange={(e) =>
                                    setSubscriptionForm({ ...subscriptionForm, dueDay: e.target.value })
                                  }
                                  required
                                />
                              </div>

                                <FormField
                                  label="Valor"
                                  htmlFor="amount"
                                  currency
                                  onChangeValue={(value) =>
                                    setSubscriptionForm({ ...subscriptionForm, amount: `${value}` })
                                  }
                                  value={subscriptionForm.amount || ''}
                                  placeholder="0,00"
                                />

                                <FormField
                                  label="Observações"
                                  htmlFor="notes"
                                  textArea
                                  value={subscriptionForm.notes}
                                  onChangeTextArea={(e) =>
                                    setSubscriptionForm({ ...subscriptionForm, notes: e.target.value })
                                  }
                                  placeholder="Informações adicionais..."
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                              <Button
                                onClick={handleCancelSubscriptionForm}
                                variant="outline"
                              >
                                Cancelar
                              </Button>
                              <Button onClick={handleSaveSubscription}>
                                {editingSubscriptionId ? 'Atualizar' : 'Criar'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Patrimônio */}
                <TabsContent value="patrimonio" className="space-y-6">
                  {loadingPatrimony ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--card))]" />
                    </div>
                  ) : (
                    <PatrimonySection
                      properties={properties}
                      vehicles={vehicles}
                      valuableAssets={valuableAssets}
                      showPropertyForm={showPropertyForm}
                      propertyForm={propertyForm}
                      editingPropertyId={editingPropertyId}
                      onAddProperty={handleAddProperty}
                      onEditProperty={handleEditProperty}
                      onSaveProperty={handleSaveProperty}
                      onDeleteProperty={handleDeleteProperty}
                      onCancelPropertyForm={handleCancelPropertyForm}
                      setPropertyForm={setPropertyForm}
                      showVehicleForm={showVehicleForm}
                      vehicleForm={vehicleForm}
                      editingVehicleId={editingVehicleId}
                      onAddVehicle={handleAddVehicle}
                      onEditVehicle={handleEditVehicle}
                      onSaveVehicle={handleSaveVehicle}
                      onDeleteVehicle={handleDeleteVehicle}
                      onCancelVehicleForm={handleCancelVehicleForm}
                      setVehicleForm={setVehicleForm}
                      showValuableAssetForm={showValuableAssetForm}
                      valuableAssetForm={valuableAssetForm}
                      editingValuableAssetId={editingValuableAssetId}
                      onAddValuableAsset={handleAddValuableAsset}
                      onEditValuableAsset={handleEditValuableAsset}
                      onSaveValuableAsset={handleSaveValuableAsset}
                      onDeleteValuableAsset={handleDeleteValuableAsset}
                      onCancelValuableAssetForm={handleCancelValuableAssetForm}
                      setValuableAssetForm={setValuableAssetForm}
                    />
                  )}
                </TabsContent>

                {/* Tab: Planejamento Financeiro */}
                <TabsContent value="planejamento" className="space-y-4">
                  {loadingFinancialGoals ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--nav-background))]" />
                    </div>
                  ) : (
                    <>
                      <FinancialGoalsSection
                        goals={financialGoals}
                        isClient={isClient}
                        showGoalForm={showGoalForm}
                        goalForm={goalForm}
                        editingGoalId={editingGoalId}
                        onAddGoal={handleAddGoal}
                        onEditGoal={handleEditGoal}
                        onSaveGoal={handleSaveGoal}
                        onDeleteGoal={handleDeleteGoal}
                        onCancelGoalForm={handleCancelGoalForm}
                        setGoalForm={setGoalForm}
                      />

                      {loadingMonthlyBudgets ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--nav-background))]" />
                        </div>
                      ) : (
                        <MonthlyBudgetsSection
                          clientId={clientId}
                          isClient={isClient}
                          budgets={monthlyBudgets}
                          showBudgetForm={showBudgetForm}
                          budgetForm={budgetForm}
                          editingBudgetId={editingBudgetId}
                          onAddBudget={handleAddBudget}
                          onEditBudget={handleEditBudget}
                          onSaveBudget={handleSaveBudget}
                          onDeleteBudget={handleDeleteBudget}
                          onCancelBudgetForm={handleCancelBudgetForm}
                          setBudgetForm={setBudgetForm}
                        />
                      )}
                    </>
                  )}
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
                        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">
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
                              {questions[currentQuestionIndex]?.options.map((answer: { id: string; answerText: string; value: string }) => (
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
                        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Perfil de Investidor
                        </h3>
                        <Button
                          type="button"
                          onClick={handleStartNewQuestionnaire}
                        >
                          Realizar Novo Questionário
                        </Button>
                      </div>

                      {latestQuestionnaire && latestQuestionnaire.riskProfile !== 'Nenhum' ? (
                        <div className="space-y-4">
                          {/* Profile summary */}
                          <div className={`p-6 rounded-lg ${getRiskProfileColor(latestQuestionnaire.riskProfile)}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                                Perfil: {latestQuestionnaire.riskProfile}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <Calendar className="w-4 h-4" />
                                {new Date(latestQuestionnaire.completedAt).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {getRiskProfileDescription(latestQuestionnaire.riskProfile)}
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-300 dark:border-gray-600">
                              <div className="flex gap-6 text-sm">
                                <div>
                                  <span className="text-[hsl(var(--muted-foreground))]">Pontuação Total: </span>
                                  <span className="font-semibold text-[hsl(var(--foreground))]">
                                    {latestQuestionnaire.totalWeight}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[hsl(var(--muted-foreground))]">Média: </span>
                                  <span className="font-semibold text-[hsl(var(--foreground))]">
                                    {latestQuestionnaire.averageWeight.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Questions and answers */}
                          <div className="space-y-3">
                            <h5 className="font-medium text-[hsl(var(--foreground))]">
                              Respostas do Questionário:
                            </h5>
                            {latestQuestionnaire.responses.map((response: { id: string; question: string; answer: string; weight: number }, index: number) => (
                              <div
                                key={response.id}
                                className="bg-[hsl(var(--card-accent))] p-4 rounded-lg"
                              >
                                <p className="font-medium text-[hsl(var(--foreground))] mb-2">
                                  {index + 1}. {response.question}
                                </p>
                                <p className="text-[hsl(var(--muted-foreground))] pl-4">
                                  → {response.answer}
                                  <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                                    (Peso: {response.weight})
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 bg-[hsl(var(--nav-background))]/15 rounded-lg">
                          <AlertCircle className="w-12 h-12 text-[hsl(var(--muted-foreground))]" />
                          <p className="text-[hsl(var(--muted-foreground))] text-center mb-4">
                            Este cliente ainda não possui um perfil de investidor cadastrado.
                          </p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center mb-6">
                            Realize o questionário para determinar o perfil de investidor do cliente.
                          </p>
                        </div>
                      )}
                    </div>
                  )}


                      {/* Conformidade Section */}
                      <div className="mt-6 p-6 bg-[hsl(var(--card-accent))] rounded-lg border border-[hsl(var(--app-border))]">
                        <div className="pb-2 border-b border-gray-100 dark:border-gray-800 mb-4">
                          <h4 className="text-lg font-semibold text-[hsl(var(--foreground))]">Conformidade (PLD/CPFT + PEP)</h4>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">Informações de conformidade e PEP</p>
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
                                <h5 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
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
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">Pontuação</p>
                                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                  {client.pldRiskScore || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[hsl(var(--foreground))]">Você ocupa ou foi ocupante de cargo público relevante?</Label>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="isPublicPosition"
                                  checked={!!formData.isPublicPosition}
                                  onChange={() => setFormData({ ...formData, isPublicPosition: true })}
                                />
                                <span className="text-[hsl(var(--foreground))]">Sim</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="isPublicPosition"
                                  checked={!formData.isPublicPosition}
                                  onChange={() => setFormData({ ...formData, isPublicPosition: false })}
                                />
                                <span className="text-[hsl(var(--foreground))]">Não</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[hsl(var(--foreground))]">É cônjuge / parente / sócio de PEP?</Label>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="isRelatedToPEP"
                                  checked={!!formData.isRelatedToPEP}
                                  onChange={() => setFormData({ ...formData, isRelatedToPEP: true })}
                                />
                                <span className="text-[hsl(var(--foreground))]">Sim</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="isRelatedToPEP"
                                  checked={!formData.isRelatedToPEP}
                                  onChange={() => setFormData({ ...formData, isRelatedToPEP: false })}
                                />
                                <span className="text-[hsl(var(--foreground))]">Não</span>
                              </label>
                            </div>
                          </div>

                        {/* PEP details - shown if any of the two above is true */}
                        {(formData.isPublicPosition || formData.isRelatedToPEP) && (
                          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[hsl(var(--foreground))]">Nome da pessoa exposta</Label>
                              <Input value={formData.pepName} onChange={(e) => setFormData({ ...formData, pepName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[hsl(var(--foreground))]">Cargo/Função</Label>
                              <Input value={formData.pepRole} onChange={(e) => setFormData({ ...formData, pepRole: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[hsl(var(--foreground))]">Órgão/Entidade</Label>
                              <Input value={formData.pepEntity} onChange={(e) => setFormData({ ...formData, pepEntity: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[hsl(var(--foreground))]">País</Label>
                              <Input value={formData.pepCountry} onChange={(e) => setFormData({ ...formData, pepCountry: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[hsl(var(--foreground))]">Data início</Label>
                              <DateInput value={formData.pepStartDate} onChange={(value) => setFormData({ ...formData, pepStartDate: value })} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[hsl(var(--foreground))]">Data término (se aplicável)</Label>
                              <DateInput value={formData.pepEndDate} onChange={(value) => setFormData({ ...formData, pepEndDate: value })} />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-[hsl(var(--foreground))]">Você é o proprietário real dos recursos?</Label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input type="radio" name="isBeneficialOwner" checked={!!formData.isBeneficialOwner} onChange={() => setFormData({ ...formData, isBeneficialOwner: true })} />
                              <span className="text-[hsl(var(--foreground))]">Sim</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name="isBeneficialOwner" checked={!formData.isBeneficialOwner} onChange={() => setFormData({ ...formData, isBeneficialOwner: false })} />
                              <span className="text-[hsl(var(--foreground))]">Não</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-[hsl(var(--foreground))]">Origem dos recursos</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {['Salário / Rendimento próprio', 'Lucros / Dividendos', 'Venda de bens', 'Herança / Doações', 'Outros'].map(opt => (
                              <label key={opt} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="resourceOrigin"
                                  checked={formData.resourceOrigin === opt}
                                  onChange={() => setFormData({ ...formData, resourceOrigin: opt === 'Outros' ? '' : opt })}
                                />
                                <span className="text-[hsl(var(--foreground))]">{opt}</span>
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
                          <Label className="text-[hsl(var(--foreground))]">Transações internacionais</Label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input type="radio" name="internationalTransactions" checked={!!formData.internationalTransactions} onChange={() => setFormData({ ...formData, internationalTransactions: true })} />
                              <span className="text-[hsl(var(--foreground))]">Sim</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name="internationalTransactions" checked={!formData.internationalTransactions} onChange={() => setFormData({ ...formData, internationalTransactions: false })} />
                              <span className="text-[hsl(var(--foreground))]">Não</span>
                            </label>
                          </div>
                        </div>

                        <div className="md:col-span-2 mt-2">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              className='mt-1'
                              checked={!!formData.pldDeclarationAccepted}
                              onChange={(e) => {
                                const accepted = e.target.checked;
                                setFormData({ ...formData, pldDeclarationAccepted: accepted, pldDeclarationDate: accepted ? new Date().toISOString() : '' });
                              }}
                            />
                            <span className="text-[hsl(var(--foreground))]">Declaro que as informações fornecidas acima são verdadeiras e completas, e compreendo que a omissão ou falsificação de informações pode acarretar consequências legais.</span>
                          </label>
                        </div>
                      </div>
                    </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
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
      </StLoading>
    </DashboardLayout>
  );
}
