'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { DateInput } from '@/components/ui/date-input';
import { DocumentInput } from '@/components/ui/document-input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TopAddButton } from '@/components/ui/top-add-button';
import { PageTitle } from '@/components/ui/page-title';
import { StSelect } from '@/components/st-select';
import { SessionTitle } from '@/components/ui/session-title';
import { FormField } from '@/components/ui/form-field';
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

export default function NewClientPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-cadastrais');
  const [roles, setRoles] = useState<Role[]>([]);
  const [clienteRole, setClienteRole] = useState<Role | null>(null);
  const [consultants, setConsultants] = useState<{ id: string; name: string }[]>([]);

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
  });

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/users/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        const cliente = data.find((r: Role) => r.name === 'Cliente');
        setClienteRole(cliente);
      }
    } catch {
      console.error('Error fetching roles');
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
        // Auto-select Brazil if only one country exists
        if (data.length === 1) {
          setFormData(prev => ({ ...prev, countryId: data[0].id }));
          fetchStates(data[0].id);
        }
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
      fetchRoles();
      fetchCategories();
      fetchCountries();
      fetchConsultants();
    }
  }, [isAuthenticated]);

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

    if (!clienteRole) {
      toast.error('Role Cliente não encontrada');
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        login: formData.login,
        name: formData.name,
        email: formData.email,
        roleIds: [clienteRole.id],
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

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cliente criado com sucesso! Uma senha temporária foi enviada por email.');
        router.push('/clientes');
      } else {
        toast.error(data.message || 'Erro ao criar cliente');
      }
    } catch {
      toast.error('Erro ao criar cliente');
    } finally {
      setSaving(false);
    }
  };

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
            Apenas administradores e consultores podem acessar esta página.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className='flex gap-4 items-center'>
            <Button
              onClick={() => router.push('/clientes')}
              variant="outline"
              size="icon"
              className="p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-8 w-8 text-[hsl(var(--foreground))]" />
            </Button>
            <PageTitle title="Novo Cliente" />
          </div>
          <TopAddButton onClick={() => router.push('/clientes/novo')} label="Novo Cliente" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-[hsl(var(--card))] rounded-lg shadow-md border border-[hsl(var(--app-border))] p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="dados-cadastrais">Dados Cadastrais</TabsTrigger>
                <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
                <TabsTrigger value="planejamento">Planejamento Financeiro</TabsTrigger>
              </TabsList>

              <ClientBasicData formData={formData} setFormData={setFormData} saving={saving} 
                countries={countries} states={states} cities={cities}
                loadingCountries={loadingCountries} loadingStates={loadingStates} loadingCities={loadingCities}
                handleCountryChange={handleCountryChange} handleStateChange={handleStateChange}
                categories={categories} consultants={consultants} isConsultant={isConsultant}
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
            </Tabs>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
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
                <Plus className="h-4 w-4" />
                Criar Cliente
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
