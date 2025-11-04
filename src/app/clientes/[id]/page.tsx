'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { DateInput } from '@/components/ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [activeTab, setActiveTab] = useState('dados-pessoais');

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

      const res = await fetch(`/api/clients/${clientId}`, {
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
                <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
                <TabsTrigger value="planejamento">Planejamento Financeiro</TabsTrigger>
              </TabsList>

              <TabsContent value="dados-pessoais" className="space-y-4">
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 dark:text-gray-300">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-gray-300">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-slate-700 dark:text-gray-300">
                      Contato
                    </Label>
                    <PhoneInput
                      id="contact"
                      value={formData.contact}
                      onChange={(value) => setFormData({ ...formData, contact: value })}
                      className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-slate-700 dark:text-gray-300">
                      Data de Nascimento
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

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-700 dark:text-gray-300">
                      Categoria
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
                        <SelectItem value="none" className="text-slate-800 dark:text-white">Nenhuma</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-slate-800 dark:text-white">
                            {category.name} - {category.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      Estado
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
                            {state.name}
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
                      Status
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

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Para alterar a senha do cliente, ele deve usar a opção &quot;Esqueci minha senha&quot; na tela de login.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="patrimonio" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-slate-600 dark:text-gray-400 text-center">
                    A funcionalidade de Patrimônio será implementada em breve.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="planejamento" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-slate-600 dark:text-gray-400 text-center">
                    A funcionalidade de Planejamento Financeiro será implementada em breve.
                  </p>
                </div>
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
