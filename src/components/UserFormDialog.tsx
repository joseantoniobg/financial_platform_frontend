'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  roles: Role[];
  status: 'active' | 'inactive';
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
  const [formData, setFormData] = useState({
    login: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleIds: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
      if (mode === 'edit' && user) {
        setFormData({
          login: user.login,
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: '',
          roleIds: user.roles.map(r => r.id),
          status: user.status,
        });
      } else {
        setFormData({
          login: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          roleIds: [],
          status: 'active',
        });
      }
    }
  }, [open, mode, user]);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/users/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
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
        const payload: any = {
          login: formData.login,
          name: formData.name,
          email: formData.email,
          roleIds: formData.roleIds,
          status: formData.status,
        };

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
      } catch (error) {
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

          {mode === 'edit' && (
            <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                Para alterar a senha do usuário, envie um email de redefinição através da opção "Esqueci minha senha" na tela de login.
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
