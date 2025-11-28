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
import { StLoading } from '@/components/StLoading';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { LocationTab } from '@/components/LocationTab';

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
      <DashboardLayout>
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
    <DashboardLayout>
      <StLoading loading={loading}>
        <div className="space-y-6">
          <PageTitle title="Localidades" subtitle="Gerencie países, estados e cidades" />
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setActiveTab('countries')}
              variant={"ghost"}
              className={`hover:font-bold ${activeTab === 'countries' ? 'font-bold text-blue-400 border-b-2 border-blue-400 rounded-xs' : ''}`}
            >
              <Globe className="h-4 w-4" />
              Países
            </Button>
            <Button
              onClick={() => setActiveTab('states')}
              variant={"ghost"}
              className={`hover:font-bold ${activeTab === 'states' ? 'font-bold text-blue-400 border-b-2 border-blue-400 rounded-xs' : ''}`}
            >
              <Map className="h-4 w-4" />
              Estados
            </Button>
            <Button
              onClick={() => setActiveTab('cities')}
              variant={"ghost"}
              className={`hover:font-bold ${activeTab === 'cities' ? 'font-bold text-blue-400 border-b-2 border-blue-400 rounded-xs' : ''}`}
            >
              <MapPin className="h-4 w-4" />
              Cidades
            </Button>
          </div>

          {/* Countries Tab */}
          {activeTab === 'countries' && (
            <LocationTab 
              title="Países"
              handleCreate={handleCreateCountry}
              labelCreate="Adicionar País"
              loading={loading}
              columns={['Nome', 'Código', 'Status', 'Ações']}
              items={countries.map(country => ({
                Nome: country.name,
                Código: country.code,
                Status: <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                country.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {country.isActive ? 'Ativo' : 'Inativo'}
                            </span>,
                Ações: <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEditCountry(country)}
                            variant={"edit"}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCountry(country.id)}
                            variant={"destructive"}
                            title="Desativar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
              }))}
              noItemsLabel="Nenhum país cadastrado"
            />
          )}

          {/* States Tab */}
          {activeTab === 'states' && (
            <LocationTab
              title="Estados"
              handleCreate={handleCreateState}
              labelCreate="Adicionar Estado"
              loading={loading}
              columns={['Nome', 'Código', 'País', 'Status', 'Ações']}
              items={states.map(state => ({
                Nome: state.name,
                Código: state.code,
                País: state.country?.name,
                Status: <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                state.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {state.isActive ? 'Ativo' : 'Inativo'}
                            </span>,
                Ações: <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEditState(state)}
                            variant={"edit"}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteState(state.id)}
                            variant={"destructive"}
                            title="Desativar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
              }))}
              noItemsLabel="Nenhum estado cadastrado"
            />
          )}

          {/* Cities Tab */}
          {activeTab === 'cities' && (
            <LocationTab
              title="Cidades"
              handleCreate={handleCreateCity}
              labelCreate="Adicionar Cidade"
              loading={loading}
              columns={['Nome', 'Estado', 'País', 'Status', 'Ações']}
              items={cities.map(city => ({
                Nome: city.name,
                Estado: city.state?.name,
                País: city.state?.country?.name,
                Status: <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                city.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {city.isActive ? 'Ativo' : 'Inativo'}
                            </span>,
                Ações: <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEditCity(city)}
                            variant={"edit"}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCity(city.id)}
                            variant={"destructive"}
                            title="Desativar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
              }))}
              noItemsLabel="Nenhuma cidade cadastrada"
            />
          )}
        </div>
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
      </StLoading>
    </DashboardLayout>
  );
}
