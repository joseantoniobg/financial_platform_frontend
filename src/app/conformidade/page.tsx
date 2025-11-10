'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConformidadePage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCurrentUser();
  }, [isAuthenticated]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        toast.error('Não autenticado');
        return;
      }
      const meData = await meRes.json();
      const id = meData.user?.sub;
      if (!id) {
        toast.error('Usuário não encontrado');
        return;
      }
      setUserId(id);

      const userRes = await fetch(`/api/users/${id}`);
      if (!userRes.ok) {
        toast.error('Erro ao carregar seus dados');
        return;
      }
      const userData = await userRes.json();

      setFormData({
        isPublicPosition: !!userData.isPublicPosition,
        isRelatedToPEP: !!userData.isRelatedToPEP,
        pepName: userData.pepName || '',
        pepRole: userData.pepRole || '',
        pepEntity: userData.pepEntity || '',
        pepCountry: userData.pepCountry || '',
        pepStartDate: userData.pepStartDate || '',
        pepEndDate: userData.pepEndDate || '',
        isBeneficialOwner: !!userData.isBeneficialOwner,
        resourceOrigin: userData.resourceOrigin || '',
        internationalTransactions: !!userData.internationalTransactions,
        pldDeclarationAccepted: !!userData.pldDeclarationAccepted,
        pldDeclarationDate: userData.pldDeclarationDate || '',
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      toast.error('Erro ao carregar seus dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        isPublicPosition: !!formData.isPublicPosition,
        isRelatedToPEP: !!formData.isRelatedToPEP,
        pepName: formData.pepName || undefined,
        pepRole: formData.pepRole || undefined,
        pepEntity: formData.pepEntity || undefined,
        pepCountry: formData.pepCountry || undefined,
        pepStartDate: formData.pepStartDate || undefined,
        pepEndDate: formData.pepEndDate || undefined,
        isBeneficialOwner: !!formData.isBeneficialOwner,
        resourceOrigin: formData.resourceOrigin || undefined,
        internationalTransactions: !!formData.internationalTransactions,
        pldDeclarationAccepted: !!formData.pldDeclarationAccepted,
        pldDeclarationDate: formData.pldDeclarationDate || undefined,
      };

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Conformidade salva com sucesso');
      } else {
        toast.error(data.message || 'Erro ao salvar conformidade');
      }
    } catch (error) {
      console.error('Error saving conformity:', error);
      toast.error('Erro ao salvar conformidade');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout userName={user?.name}>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Conformidade (PLD/CPFT + PEP)</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#B4F481]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#0D2744] p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Você ocupa ou foi ocupante de cargo público relevante?</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="isPublicPosition" checked={!!formData.isPublicPosition} onChange={() => setFormData({ ...formData, isPublicPosition: true })} />
                    <span className="text-slate-700 dark:text-gray-300">Sim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="isPublicPosition" checked={!formData.isPublicPosition} onChange={() => setFormData({ ...formData, isPublicPosition: false })} />
                    <span className="text-slate-700 dark:text-gray-300">Não</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>É cônjuge / companheiro / parente até 2º grau / sócio de alguém que é ou foi PEP?</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="isRelatedToPEP" checked={!!formData.isRelatedToPEP} onChange={() => setFormData({ ...formData, isRelatedToPEP: true })} />
                    <span className="text-slate-700 dark:text-gray-300">Sim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="isRelatedToPEP" checked={!formData.isRelatedToPEP} onChange={() => setFormData({ ...formData, isRelatedToPEP: false })} />
                    <span className="text-slate-700 dark:text-gray-300">Não</span>
                  </label>
                </div>
              </div>

              {(formData.isPublicPosition || formData.isRelatedToPEP) && (
                <>
                  <div className="space-y-2">
                    <Label>Nome da pessoa exposta</Label>
                    <Input value={formData.pepName} onChange={(e) => setFormData({ ...formData, pepName: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Cargo/Função</Label>
                    <Input value={formData.pepRole} onChange={(e) => setFormData({ ...formData, pepRole: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Órgão/Entidade</Label>
                    <Input value={formData.pepEntity} onChange={(e) => setFormData({ ...formData, pepEntity: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>País</Label>
                    <Input value={formData.pepCountry} onChange={(e) => setFormData({ ...formData, pepCountry: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de início</Label>
                    <DateInput value={formData.pepStartDate} onChange={(value) => setFormData({ ...formData, pepStartDate: value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de término (se aplicável)</Label>
                    <DateInput value={formData.pepEndDate} onChange={(value) => setFormData({ ...formData, pepEndDate: value })} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Você é o proprietário real dos recursos?</Label>
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

              <div className="md:col-span-2 space-y-2">
                <Label>Origem dos recursos</Label>
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
                {formData.resourceOrigin === '' && (
                  <div className="mt-2">
                    <Input placeholder="Descreva a origem dos recursos" value={formData.resourceOrigin} onChange={(e) => setFormData({ ...formData, resourceOrigin: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Transações internacionais</Label>
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
                  <div className="text-sm">
                    <div className="font-medium text-slate-800 dark:text-white">Declaração</div>
                    <div className="text-slate-600 dark:text-gray-400">Declaro que as informações prestadas são verdadeiras e estou ciente das políticas de PLD/FT.</div>
                    {formData.pldDeclarationDate && (
                      <div className="text-xs text-slate-500 dark:text-gray-500 mt-1">Data: {new Date(formData.pldDeclarationDate).toLocaleString('pt-BR')}</div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <Button type="submit" disabled={saving} className="bg-[#B4F481] text-[#0A1929]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
