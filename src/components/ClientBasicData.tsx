import { DateDisplay } from "./DateDisplay";
import { StSelect } from "./st-select";
import { FormField } from "./ui/form-field";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { SessionTitle } from "./ui/session-title";
import { TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { YesNoField } from "./yes-no-field";

type Dependent = {
    id?: string;
    name: string;
    sex: 'Masculino' | 'Feminino';
    birthDate: string;
    relation: string;
};

type ClientBasicDataProps = {
    formData: any;
    setFormData: (data: any) => void;
    saving: boolean;
    categories: Array<{ id: string; name: string; description: string }>;
    consultants: Array<{ id: string; name: string }>;
    isConsultant: boolean;
    countries: Array<{ id: string; name: string }>;
    states: Array<{ id: string; name: string; code: string }>;
    cities: Array<{ id: string; name: string }>;
    loadingCountries: boolean;
    loadingStates: boolean;
    loadingCities: boolean;
    handleCountryChange: (value: string) => void;
    handleStateChange: (value: string) => void;
    newClient?: boolean;
    client?: { createdAt?: string; updatedAt?: string, userNumber?: number } | null;
    maritalStatuses: Array<{ id: string; name: string }>;
    loadingMaritalStatuses: boolean;
    dependents: Dependent[];
    onAddDependent: (dependent: Dependent) => Promise<void>;
    onUpdateDependent: (id: string, dependent: Dependent) => Promise<void>;
    onDeleteDependent: (id: string) => Promise<void>;
};

export function ClientBasicData({ formData, setFormData, saving, categories, consultants, isConsultant, 
                                countries, states, cities, 
                                loadingCountries, loadingStates, loadingCities,
                                handleCountryChange, handleStateChange, newClient, client, maritalStatuses, loadingMaritalStatuses,
                                dependents, onAddDependent, onUpdateDependent, onDeleteDependent }: ClientBasicDataProps) {
    
    // Get selected marital status name
    const selectedMaritalStatus = maritalStatuses.find(ms => ms.id === formData.maritalStatusId);
    const isMarried = selectedMaritalStatus?.name === 'Casado(a)';
    
    // Dependent form state
    const [showDependentForm, setShowDependentForm] = useState(false);
    const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
    const [dependentForm, setDependentForm] = useState<Dependent>({
        name: '',
        sex: 'Masculino',
        birthDate: '',
        relation: '',
    });

    const handleAddDependent = () => {
        setEditingDependent(null);
        setDependentForm({
            name: '',
            sex: 'Masculino',
            birthDate: '',
            relation: '',
        });
        setShowDependentForm(true);
    };

    const handleEditDependent = (dependent: Dependent) => {
        setEditingDependent(dependent);
        setDependentForm(dependent);
        setShowDependentForm(true);
    };

    const handleSaveDependent = async () => {
        if (editingDependent?.id) {
            await onUpdateDependent(editingDependent.id, dependentForm);
        } else {
            await onAddDependent(dependentForm);
        }
        setShowDependentForm(false);
        setEditingDependent(null);
    };

    const handleCancelDependent = () => {
        setShowDependentForm(false);
        setEditingDependent(null);
    };
    
    return (
        <TabsContent value="dados-cadastrais">
                {/* Date Information Banner - Only show when editing (not new client) */}
                {!newClient && client && (
                  <div className="flex gap-4">
                    <div className="p-3 bg-[hsl(var(--green))]/30 text-lg font-bold text-[hsl(var(--dark-green))] rounded-lg border border-[hsl(var(--border))]">ID: #{client.userNumber?.toString().padStart(9, '0')}</div>
                    <div className="inline-block p-4 bg-[hsl(var(--card-accent))]/50 rounded-lg border border-[hsl(var(--border))]">
                      <div className="flex items-center justify-center gap-4">
                        <DateDisplay label="Data de Cadastro:" date={client.createdAt} />
                        <DateDisplay label="Última Atualização:" date={client.updatedAt} />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <SessionTitle title="Dados Principais" subTitle="Informações básicas do cliente" />                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField 
                        label="Nome Completo / Razão Social"
                        required
                        htmlFor="name"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={saving}
                        placeholder="Digite o nome completo ou razão social"
                      />

                      <StSelect 
                        htmlFor='category'
                        value={formData.categoryId || 'none'}
                        onChange={(value: string) => setFormData({ ...formData, categoryId: value === 'none' ? '' : value })}
                        loading={saving}
                        items={categories.map((c) => ({ id: c.id, description: `${c.name} - ${c.description}` }))}
                        label='Categoria'
                        required
                        searchable={false}
                      />

                      <FormField
                        label='Documento (CPF/CNPJ)'
                        value={formData.document}
                        disabled={(categories.find(c => c.id === formData.categoryId)?.name ?? '') !== ''}
                        onChangeValue={(value) => setFormData({ ...formData, document: value })}
                        category={categories.find(c => c.id === formData.categoryId)?.name === 'PF' ? 'PF' : 'PJ'}
                        document
                        htmlFor='document'
                      />

                      <div className="flex gap-4 flex-wrap">
                        <div className="flex-1">
                          <FormField
                            label='Data de Nascimento / Fundação'
                            date
                            id='birthdate'
                            value={formData.birthDate}
                            onChangeValue={(value) => setFormData({ ...formData, birthDate: value })}
                            disabled={saving}
                            htmlFor='birthDate'
                          />
                        </div>
                        <div className="flex-1">
                          <FormField
                            label='Idade'
                            id="age"
                            value={formData.birthDate ? (() => {
                              const birth = new Date(formData.birthDate);
                              const today = new Date();
                              let age = today.getFullYear() - birth.getFullYear();
                              const monthDiff = today.getMonth() - birth.getMonth();
                              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                                age--;
                              }
                              return age >= 0 ? `${age} anos` : '';
                            })() : ''}
                            disabled
                            placeholder="Calculado automaticamente"
                          />
                        </div>
                    </div>
                  </div>
                </div>

                {/* Sector 2: Informações da Consultoria */}
                <div className="space-y-4">
                  <SessionTitle title="Informações da Consultoria" subTitle="Detalhes do contrato e plano" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StSelect 
                      htmlFor='consultancyType'
                      value={formData.consultancyType || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, consultancyType: value === 'none' ? '' : value })}
                      loading={saving}
                      items={[{ id: 'none', description: 'Nenhum' }, { id: 'Financeira', description: 'Financeira' }, { id: 'Empresarial', description: 'Empresarial' }, { id: 'Pessoal', description: 'Pessoal' }]}
                      label='Tipo de Consultoria'
                      searchable={false}
                    />

                    <StSelect 
                      htmlFor='plan'
                      value={formData.plan || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, plan: value === 'none' ? '' : value })}
                      loading={saving}
                      items={[{ id: 'none', description: 'Nenhum' }, 
                              { id: 'Mensal', description: 'Mensal' }, 
                              { id: 'Trimestral', description: 'Trimestral' }, 
                              { id: 'Semestral', description: 'Semestral' }, 
                              { id: 'Anual', description: 'Anual' }, 
                              { id: 'Personalizado', description: 'Personalizado' }]}
                      label='Plano'
                      searchable={false}
                    />

                    <FormField
                      label="Valor do Plano (R$)"
                      currency
                      id="planValue"
                      value={formData.planValue}
                      onChangeValue={(value) => setFormData({ ...formData, planValue: `${value}` })}
                      disabled={saving}
                      placeholder="Digite o valor do plano"
                    />

                    <FormField
                      label="Contrato nº"
                      id="contractNumber"
                      htmlFor="contractNumber"
                      value={formData.contractNumber}
                      onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                      disabled={saving}
                      placeholder="Ex: 028/2025"
                    />

                    <StSelect 
                      htmlFor='contractStatus'
                      value={formData.contractStatus || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, contractStatus: value === 'none' ? '' : value })}
                      loading={saving}
                      items={[{ id: 'none', description: 'Nenhum' }, 
                              { id: 'Ativo', description: 'Ativo' }, 
                              { id: 'Inativo', description: 'Inativo' }, 
                              { id: 'Encerrado', description: 'Encerrado' }, 
                              { id: 'Em negociação', description: 'Em negociação' }]}
                      label='Situação / Status'
                      searchable={false}
                    />

                    <StSelect 
                      htmlFor= 'consultant'
                      value={formData.consultantId || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, consultantId: value === 'none' ? '' : value })}
                      loading={saving || isConsultant}
                      items={consultants.map((consultant) => ({ id: consultant.id, description: consultant.name }))}
                      label='Consultor Responsável'
                    />

                    <FormField
                      label='Data de Início'
                      date
                      id='contractStartDate'
                      value={formData.contractStartDate}
                      onChangeValue={(value) => setFormData({ ...formData, contractStartDate: `${value}` })}
                      disabled={saving}
                      htmlFor='contractStartDate'
                    />

                    <FormField
                      label='Data de Fim'
                      date
                      id='contractEndDate'
                      value={formData.contractEndDate}
                      onChangeValue={(value) => setFormData({ ...formData, contractEndDate: `${value}` })}
                      disabled={saving}
                      htmlFor='contractEndDate'
                    />

                    <FormField
                      label='Último Atendimento'
                      date
                      id='lastMeeting'
                      value={formData.lastMeeting}
                      onChangeValue={(value) => setFormData({ ...formData, lastMeeting: `${value}` })}
                      disabled={saving}
                      htmlFor='lastMeeting'
                    />
                  </div>
                </div>

                {/* Sector 3: Contato */}
                <div className="space-y-4">
                  <SessionTitle title="Contato" subTitle="Informações de contato e localização" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Login"
                      required
                      htmlFor="login"
                      id="login"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      disabled={saving}
                      placeholder="Nome de usuário"
                    />

                    <FormField
                      label="E-mail"
                      required
                      htmlFor="email"
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={saving}
                      placeholder="email@exemplo.com"
                    />

                    <FormField
                      label="Telefone / WhatsApp"
                      htmlFor="contact"
                      id="contact"
                      value={formData.contact}
                      onChangeValue={(value) => setFormData({ ...formData, contact: `${value}` })}
                      disabled={saving}
                      phone
                    />

                    <StSelect 
                      htmlFor='maritalStatus'
                      value={formData.maritalStatusId || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, maritalStatusId: value === 'none' ? '' : value, spouseName: value === 'none' ? '' : formData.spouseName })}
                      loading={saving || loadingMaritalStatuses}
                      items={[{ id: 'none', description: 'Selecione...' }, ...maritalStatuses.map((ms) => ({ id: ms.id, description: ms.name }))]}
                      label='Estado Civil'
                      searchable={false}
                    />

                  {isMarried && (
                      <FormField
                        label="Nome do Cônjuge"
                        htmlFor="spouseName"
                        id="spouseName"
                        value={formData.spouseName || ''}
                        onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                        disabled={saving}
                        placeholder="Digite o nome do cônjuge"
                      />
                  )}
                  
                  <YesNoField
                    label="Seguro de Vida"
                    id="hasLifeInsurance"
                    value={formData.hasLifeInsurance ? 'true' : 'false'}
                    onValueChange={(value) => setFormData({ ...formData, hasLifeInsurance: value })}
                    disabled={saving}
                  />

                  <YesNoField
                    label="Previdência Privada"
                    id="hasPrivatePension"
                    value={formData.hasPrivatePension ? 'true' : 'false'}
                    onValueChange={(value) => setFormData({ ...formData, hasPrivatePension: value })}
                    disabled={saving}
                  />

                  <div className="md:col-span-2 space-y-2">
                    <FormField
                      label="Endereço Completo"
                      htmlFor="address"
                      id="address"
                      value={formData.address}
                      onChangeTextArea={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                      disabled={saving}
                      placeholder="Rua, número, complemento, bairro"
                      textArea
                      rows={3}
                    />
                  </div>

                  <StSelect
                    htmlFor='country'
                    label='País'
                    value={formData.countryId}
                    onChange={handleCountryChange}
                    loading={saving || loadingCountries}
                    items={countries.map((c) => ({ id: c.id, description: c.name }))}
                  />

                    <StSelect
                      htmlFor='state'
                      label='Estado (UF)'
                      value={formData.stateId}
                      onChange={handleStateChange}
                      loading={saving || loadingStates || !formData.countryId}
                      items={states.map((s) => ({ id: s.id, description: `${s.name} (${s.code})` }))}
                    />

                    <StSelect
                      htmlFor='city'
                      label='Cidade'
                      value={formData.cityId}
                      onChange={(value: string) => setFormData({ ...formData, cityId: value })}
                      loading={saving || loadingCities || !formData.stateId}
                      items={cities.map((c) => ({ id: c.id, description: c.name }))}
                    />

                    <StSelect
                      htmlFor='status'
                      label='Status de Acesso'
                      value={formData.status}
                      onChange={(value: string) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                      loading={saving}
                      items={[{ id: 'active', description: 'Ativo' }, { id: 'inactive', description: 'Inativo' }]}
                      searchable={false}
                    />
                  </div>
                </div>

                {/* Sector 4: Prospecção e Origem */}
                <div className="space-y-4">
                  <SessionTitle title="Prospecção e Origem" subTitle="Origem e informações profissionais" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StSelect
                      htmlFor='prospectionOrigin'
                      label='Origem da Prospecção'
                      value={formData.prospectionOrigin || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, prospectionOrigin: value === 'none' ? '' : value })}
                      loading={saving}
                      items={[{ id: 'none', description: 'Nenhum' }, 
                              { id: 'Indicação', description: 'Indicação' }, 
                              { id: 'Instagram', description: 'Instagram' }, 
                              { id: 'Site', description: 'Site' }, 
                              { id: 'Eventos', description: 'Eventos' }, 
                              { id: 'Outro', description: 'Outro' }]}
                      searchable={false}
                    />

                    <FormField
                      label="Profissão / Atividade"
                      htmlFor="profession"
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      disabled={saving}
                      placeholder="Ex: Médico, Empresário, Autônomo"
                    />

                  {newClient && 
                    <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            Informações Automáticas
                        </h3>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-gray-400">
                            <p><strong>Data de Cadastro:</strong> Será gerada automaticamente ao criar o cliente</p>
                            <p><strong>Última Atualização:</strong> Será atualizada a cada modificação nos dados</p>
                        </div>
                    </div>}
                  </div>
                </div>

                {/* Dependents Section - Only show when not creating new client */}
                {!newClient && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <SessionTitle title="Dependentes" subTitle="Familiares e dependentes do cliente" />
                      <Button
                        type="button"
                        onClick={handleAddDependent}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Dependente
                      </Button>
                    </div>

                    {showDependentForm && (
                      <div className="p-4 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card-accent))]/30">
                        <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
                          {editingDependent ? 'Editar Dependente' : 'Novo Dependente'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              label="Nome Completo"
                              required
                              htmlFor="depName"
                              id="depName"
                              value={dependentForm.name}
                              onChange={(e) => setDependentForm({ ...dependentForm, name: e.target.value })}
                              disabled={saving}
                              placeholder="Nome do dependente"
                            />

                          <div className="space-y-2">
                            <Label className="text-[hsl(var(--foreground))]">Sexo <span className="text-red-500">*</span></Label>
                            <RadioGroup
                              value={dependentForm.sex}
                              onValueChange={(value) => setDependentForm({ ...dependentForm, sex: value as 'Masculino' | 'Feminino' })}
                              disabled={saving}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Masculino" id="dep-masculino" />
                                <Label htmlFor="dep-masculino" className="font-normal cursor-pointer">Masculino</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Feminino" id="dep-feminino" />
                                <Label htmlFor="dep-feminino" className="font-normal cursor-pointer">Feminino</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <FormField
                            label="Data de Nascimento"
                            required
                            htmlFor="depBirthDate"
                            id="depBirthDate"
                            date
                            value={dependentForm.birthDate}
                            onChangeValue={(value) => setDependentForm({ ...dependentForm, birthDate: `${value}` })}
                            disabled={saving}
                          />

                          <FormField
                            label="Relação"
                            required
                            htmlFor="depRelation"
                            id="depRelation"
                            value={dependentForm.relation}
                            onChange={(e) => setDependentForm({ ...dependentForm, relation: e.target.value })}
                            disabled={saving}
                            placeholder="Ex: Filho(a), Cônjuge, Pai/Mãe"
                          />
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            type="button"
                            onClick={handleSaveDependent}
                            disabled={saving || !dependentForm.name || !dependentForm.birthDate || !dependentForm.relation}
                          >
                            {editingDependent ? 'Atualizar' : 'Adicionar'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelDependent}
                            disabled={saving}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Dependents List */}
                    {dependents.length > 0 ? (
                      <div className="space-y-2">
                        {dependents.map((dependent) => (
                          <div
                            key={dependent.id}
                            className="flex items-center justify-between p-3 border border-[hsl(var(--border))] rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-[hsl(var(--foreground))]">{dependent.name}</h4>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {dependent.sex} • {new Date(dependent.birthDate).toLocaleDateString('pt-BR')} • {dependent.relation}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDependent(dependent)}
                                disabled={saving}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => dependent.id && onDeleteDependent(dependent.id)}
                                disabled={saving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
                        Nenhum dependente cadastrado
                      </p>
                    )}
                  </div>
                )}

                {/* Info Box */}
                {newClient && <div className="p-3 bg-[hsl(var(--card-accent))] border border-blue-200 dark:border-blue-800 rounded-md mt-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Uma senha temporária será gerada automaticamente e enviada por email para o cliente. 
                    O cliente deverá alterar a senha no primeiro acesso.
                  </p>
                </div>}
              </TabsContent>
    );
}