'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe, Map, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { CountryFormDialog } from '@/components/CountryFormDialog';
import { StateFormDialog } from '@/components/StateFormDialog';
import { CityFormDialog } from '@/components/CityFormDialog';

interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface State {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  country?: Country;
}

interface City {
  id: string;
  name: string;
  isActive: boolean;
  state?: State;
}

type TabType = 'countries' | 'states' | 'cities';

export default function LocationsPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();

  const [activeTab, setActiveTab] = useState<TabType>('countries');
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [cityDialogOpen, setCityDialogOpen] = useState(false);

  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
  const [selectedState, setSelectedState] = useState<State | undefined>();
  const [selectedCity, setSelectedCity] = useState<City | undefined>();

  // Check if user is admin or consultant
  const isAdmin = user?.roles?.some(role => ['Administrador', 'Consultor'].includes(role.name));

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      if (activeTab === 'countries') fetchCountries();
      if (activeTab === 'states') fetchStates();
      if (activeTab === 'cities') fetchCities();
    }
  }, [isAuthenticated, isAdmin, activeTab]);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/locations/countries');
      if (res.ok) {
        const data = await res.json();
        setCountries(data);
      } else {
        toast.error('Erro ao carregar países');
      }
    } catch {
      toast.error('Erro ao carregar países');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/locations/all-states');
      if (res.ok) {
        const data = await res.json();
        setStates(data);
      } else {
        toast.error('Erro ao carregar estados');
      }
    } catch {
      toast.error('Erro ao carregar estados');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/locations/all-cities');
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      } else {
        toast.error('Erro ao carregar cidades');
      }
    } catch {
      toast.error('Erro ao carregar cidades');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCountry = () => {
    setDialogMode('create');
    setSelectedCountry(undefined);
    setCountryDialogOpen(true);
  };

  const handleEditCountry = (country: Country) => {
    setDialogMode('edit');
    setSelectedCountry(country);
    setCountryDialogOpen(true);
  };

  const handleCreateState = () => {
    setDialogMode('create');
    setSelectedState(undefined);
    setStateDialogOpen(true);
  };

  const handleEditState = (state: State) => {
    setDialogMode('edit');
    setSelectedState(state);
    setStateDialogOpen(true);
  };

  const handleCreateCity = () => {
    setDialogMode('create');
    setSelectedCity(undefined);
    setCityDialogOpen(true);
  };

  const handleEditCity = (city: City) => {
    setDialogMode('edit');
    setSelectedCity(city);
    setCityDialogOpen(true);
  };

  const handleDeleteCountry = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este país?')) return;

    try {
      const res = await fetch(`/api/locations/countries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('País desativado com sucesso!');
        fetchCountries();
      } else {
        toast.error('Erro ao desativar país');
      }
    } catch {
      toast.error('Erro ao desativar país');
    }
  };

  const handleDeleteState = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este estado?')) return;

    try {
      const res = await fetch(`/api/locations/states/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Estado desativado com sucesso!');
        fetchStates();
      } else {
        toast.error('Erro ao desativar estado');
      }
    } catch {
      toast.error('Erro ao desativar estado');
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta cidade?')) return;

    try {
      const res = await fetch(`/api/locations/cities/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Cidade desativada com sucesso!');
        fetchCities();
      } else {
        toast.error('Erro ao desativar cidade');
      }
    } catch {
      toast.error('Erro ao desativar cidade');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <DashboardLayout userName={user?.name || ''}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Apenas administradores e consultores podem acessar esta página.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user?.name || ''}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Localidades</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">Gerencie países, estados e cidades</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('countries')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'countries'
                ? 'border-[#B4F481] text-[#B4F481]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            Países
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'states'
                ? 'border-[#B4F481] text-[#B4F481]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Map className="h-4 w-4" />
            Estados
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'cities'
                ? 'border-[#B4F481] text-[#B4F481]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Cidades
          </button>
        </div>

        {/* Countries Tab */}
        {activeTab === 'countries' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Países</h2>
              <button
                onClick={handleCreateCountry}
                className="flex items-center gap-2 bg-[#B4F481] text-[#0A1929] px-4 py-2 rounded-lg font-medium hover:bg-[#9FD96F] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar País
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
            ) : countries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum país cadastrado</div>
            ) : (
              <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {countries.map((country) => (
                      <tr key={country.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{country.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{country.code}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              country.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {country.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditCountry(country)}
                              className="p-2 text-[#B4F481] hover:bg-[#B4F481]/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCountry(country.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Desativar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* States Tab */}
        {activeTab === 'states' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Estados</h2>
              <button
                onClick={handleCreateState}
                className="flex items-center gap-2 bg-[#B4F481] text-[#0A1929] px-4 py-2 rounded-lg font-medium hover:bg-[#9FD96F] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Estado
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
            ) : states.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum estado cadastrado</div>
            ) : (
              <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">País</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {states.map((state) => (
                      <tr key={state.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{state.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{state.code}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{state.country?.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              state.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {state.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditState(state)}
                              className="p-2 text-[#B4F481] hover:bg-[#B4F481]/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteState(state.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Desativar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Cities Tab */}
        {activeTab === 'cities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Cidades</h2>
              <button
                onClick={handleCreateCity}
                className="flex items-center gap-2 bg-[#B4F481] text-[#0A1929] px-4 py-2 rounded-lg font-medium hover:bg-[#9FD96F] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Cidade
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
            ) : cities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma cidade cadastrada</div>
            ) : (
              <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">País</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cities.map((city) => (
                      <tr key={city.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{city.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{city.state?.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{city.state?.country?.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              city.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {city.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditCity(city)}
                              className="p-2 text-[#B4F481] hover:bg-[#B4F481]/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCity(city.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Desativar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CountryFormDialog
        open={countryDialogOpen}
        onOpenChange={setCountryDialogOpen}
        mode={dialogMode}
        country={selectedCountry}
        onSuccess={fetchCountries}
      />

      <StateFormDialog
        open={stateDialogOpen}
        onOpenChange={setStateDialogOpen}
        mode={dialogMode}
        state={selectedState}
        onSuccess={fetchStates}
      />

      <CityFormDialog
        open={cityDialogOpen}
        onOpenChange={setCityDialogOpen}
        mode={dialogMode}
        city={selectedCity}
        onSuccess={fetchCities}
      />
    </DashboardLayout>
  );
}
