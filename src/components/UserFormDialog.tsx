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
import { Button } from './ui/button';
import { StSelect } from './st-select';

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

  const [tempPassword, setTempPassword] = useState<string>('');

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

          if (mode === 'create' && data.password) {
            setTempPassword(data.password as string);
            return;
          }

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
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] border-[hsl(var(--border))] dark:border-[hsl(var(--border))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))] dark:text-white">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))] dark:text-[hsl(var(--muted-foreground))]">
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[hsl(var(--foreground))]">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[hsl(var(--foreground))]">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-[hsl(var(--foreground))]">
                Contato
              </Label>
              <PhoneInput
                id="contact"
                value={formData.contact}
                onChange={(value) => setFormData({ ...formData, contact: value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-[hsl(var(--foreground))]">
                Data de Nascimento
              </Label>
              <DateInput
                id="birthDate"
                value={formData.birthDate}
                onChange={(value) => setFormData({ ...formData, birthDate: value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <StSelect 
                htmlFor='country'
                label='País'
                items={countries.map((country) => ({ id: country.id, description: country.name }))}
                value={formData.countryId}
                onChange={handleCountryChange}
                loading={loading || loadingCountries}
              />
            </div>

            <div className="space-y-2">
              <StSelect 
                htmlFor='state'
                label='Estado'
                items={states.map((state) => ({ id: state.id, description: state.name }))}
                value={formData.stateId}
                onChange={handleStateChange}
                loading={loading || loadingStates || !formData.countryId}
              />
            </div>

            <div className="space-y-2">
              <StSelect 
                htmlFor='city'
                label='Cidade'
                items={cities.map((city) => ({ id: city.id, description: city.name }))}
                value={formData.cityId}
                onChange={(value) => setFormData({ ...formData, cityId: value })}
                loading={loading || loadingCities || !formData.stateId}
              />
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

          {tempPassword !== '' && (
            <div className="space-y-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                Senha temporária gerada: <strong>{tempPassword}</strong>
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
                  className="flex items-center space-x-2 p-2 rounded border border-[hsl(var(--app-border))] bg-[hsl(var(--card-accent))]/40 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="rounded border-[hsl(var(--app-border))] text-[hsl(var(--foreground))] focus:ring-[hsl(var(--primary))]"
                    disabled={loading}
                  />
                  <span className="text-sm text-[hsl(var(--foreground))]">{role.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <StSelect 
                htmlFor='status'
                label='Status'
                items={[
                  { id: 'active', description: 'Ativo' },
                  { id: 'inactive', description: 'Inativo' },
                ]}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                loading={loading}
                searchable={false}
              />
            </div>

            <div className="space-y-2">
              <StSelect
                htmlFor='category'
                label='Categoria'
                items={[
                  { id: 'none', description: 'Nenhuma' },
                  ...categories.map((category) => ({ id: category.id, description: `${category.name} - ${category.description}` })),
                ]}
                value={formData.categoryId || 'none'}
                onChange={(value: string) => setFormData({ ...formData, categoryId: value === 'none' ? '' : value })}
                loading={loading}
                searchable={false}
              />
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
            <Button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
