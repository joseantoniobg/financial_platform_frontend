'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { DateInput } from '@/components/ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface User {
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
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: User;
  onSuccess: () => void;
}

export function UserFormDialog({ open, onOpenChange, mode, user, onSuccess }: UserFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
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
    password: '',
    confirmPassword: '',
    roleIds: [] as string[],
    status: 'active' as 'active' | 'inactive',
    categoryId: '' as string,
    contact: '' as string,
    birthDate: '' as string,
    countryId: '' as string,
    stateId: '' as string,
    cityId: '' as string,
  });

  // Callback functions
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

  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const res = await fetch('/api/locations/countries');
      if (res.ok) {
        const data = await res.json();
        console.log('Countries loaded:', data);
        setCountries(data);
        // Auto-select Brazil if only one country exists and in create mode
        if (data.length === 1 && mode === 'create') {
          console.log('Auto-selecting Brazil:', data[0]);
          setFormData(prev => ({ ...prev, countryId: data[0].id }));
          fetchStates(data[0].id);
        }
      } else {
        console.error('Failed to fetch countries:', res.status);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  }, [fetchStates, mode]);

  // Load countries when dialog opens
  useEffect(() => {
    if (open) {
      fetchCountries();
    } else {
      // Reset form when dialog closes (for next create action)
      setFormData({
        login: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleIds: [],
        status: 'active',
        categoryId: '',
        contact: '',
        birthDate: '',
        countryId: '',
        stateId: '',
        cityId: '',
      });
      setStates([]);
      setCities([]);
    }
  }, [open, fetchCountries]);

  // Load roles, categories and set form data for edit mode
  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchCategories();
      if (mode === 'edit' && user) {
        const countryId = user.city?.state?.country?.id || '';
        const stateId = user.city?.state?.id || '';
        const cityId = user.city?.id || '';
        
        setFormData({
          login: user.login,
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: '',
          roleIds: user.roles.map(r => r.id),
          status: user.status,
          categoryId: user.clientCategory?.id || '',
          contact: user.contact || '',
          birthDate: user.birthDate || '',
          countryId,
          stateId,
          cityId,
        });
        
        // Load states and cities if user has location data
        if (countryId) {
          fetchStates(countryId);
        }
        if (stateId) {
          fetchCities(stateId);
        }
      }
    }
  }, [open, mode, user, fetchStates, fetchCities]);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/users/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
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

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.login || !formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Only validate password for edit mode (create mode sends temp password via email)
    if (mode === 'edit' && formData.password && formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.roleIds.length === 0) {
      toast.error('Selecione pelo menos um perfil');
      return;
    }

    setLoading(true);

    const submitData = async () => {
      try {
        const payload: Record<string, unknown> = {
          login: formData.login,
          name: formData.name,
          email: formData.email,
          roleIds: formData.roleIds,
          status: formData.status,
        };

        // Include categoryId if provided
        if (formData.categoryId) {
          payload.categoryId = formData.categoryId;
        }

        // Include contact if provided
        if (formData.contact) {
          payload.contact = formData.contact;
        }

        // Include birthDate if provided
        if (formData.birthDate) {
          payload.birthDate = formData.birthDate;
        }

        // Include cityId if provided
        if (formData.cityId) {
          payload.cityId = formData.cityId;
        }

        // Only include password for edit mode if provided
        if (mode === 'edit' && formData.password) {
          payload.password = formData.password;
        }

        const url = mode === 'create' ? '/api/users' : `/api/users/${user?.id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success(mode === 'create' ? 'Usuário criado com sucesso!' : 'Usuário atualizado com sucesso!');
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(data.message || 'Erro ao salvar usuário');
        }
      } catch {
        toast.error('Erro ao salvar usuário');
      } finally {
        setLoading(false);
      }
    };

    submitData();
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#0D2744] border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Preencha os dados do novo usuário'
              : 'Atualize os dados do usuário'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-slate-700 dark:text-gray-300">
                Login <span className="text-red-500">*</span>
              </Label>
              <Input
                id="login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                disabled={loading}
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
                disabled={loading}
              />
            </div>
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
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-slate-700 dark:text-gray-300">
                Contato
              </Label>
              <PhoneInput
                id="contact"
                value={formData.contact}
                onChange={(value) => setFormData({ ...formData, contact: value })}
                className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-slate-700 dark:text-gray-300">
                País
              </Label>
              <Select
                value={formData.countryId}
                onValueChange={handleCountryChange}
                disabled={loading || loadingCountries}
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
                disabled={loading || loadingStates || !formData.countryId}
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
                disabled={loading || loadingCities || !formData.stateId}
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
          </div>

          {mode === 'edit' && (
            <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                Para alterar a senha do usuário, envie um email de redefinição através da opção &quot;Esqueci minha senha&quot; na tela de login.
              </p>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Uma senha temporária será gerada automaticamente e enviada por email para o usuário. 
                O usuário deverá alterar a senha no primeiro acesso.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-gray-300">
              Perfis <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center space-x-2 p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="rounded border-gray-300 text-[#B4F481] focus:ring-[#B4F481]"
                    disabled={loading}
                  />
                  <span className="text-sm text-slate-700 dark:text-gray-300">{role.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                disabled={loading}
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

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 dark:text-gray-300">
                Categoria
              </Label>
              <Select
                value={formData.categoryId || 'none'}
                onValueChange={(value: string) => setFormData({ ...formData, categoryId: value === 'none' ? '' : value })}
                disabled={loading}
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
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
