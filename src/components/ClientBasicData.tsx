import { StSelect } from "./st-select";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SessionTitle } from "./ui/session-title";
import { TabsContent } from "./ui/tabs";

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
};

export function ClientBasicData({ formData, setFormData, saving, categories, consultants, isConsultant, 
                                countries, states, cities, 
                                loadingCountries, loadingStates, loadingCities,
                                handleCountryChange, handleStateChange, newClient }: ClientBasicDataProps) {
    return (
        <TabsContent value="dados-cadastrais">
                <div>
                  <SessionTitle title="Dados Principais" subTitle="Informações básicas do cliente" />                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
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
                    </div>

                    <div className="space-y-2">
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
                    </div>

                    <div className="space-y-2">
                      <FormField
                        label='Documento (CPF/CNPJ)'
                        value={formData.document}
                        disabled={(categories.find(c => c.id === formData.categoryId)?.name ?? '') !== ''}
                        onChangeValue={(value) => setFormData({ ...formData, document: value })}
                        category={categories.find(c => c.id === formData.categoryId)?.name === 'PF' ? 'PF' : 'PJ'}
                        document
                        htmlFor='document'
                      />
                    </div>

                    <div className="space-y-2">
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

                    <div className="space-y-2">
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

                {/* Sector 2: Informações da Consultoria */}
                <div className="space-y-4">
                  <SessionTitle title="Informações da Consultoria" subTitle="Detalhes do contrato e plano" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <StSelect 
                      htmlFor='consultancyType'
                      value={formData.consultancyType || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, consultancyType: value === 'none' ? '' : value })}
                      loading={saving}
                      items={[{ id: 'none', description: 'Nenhum' }, { id: 'Financeira', description: 'Financeira' }, { id: 'Empresarial', description: 'Empresarial' }, { id: 'Pessoal', description: 'Pessoal' }]}
                      label='Tipo de Consultoria'
                      searchable={false}
                    />
                  </div>

                  <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
                    <FormField
                      label="Valor do Plano (R$)"
                      currency
                      id="planValue"
                      value={formData.planValue}
                      onChangeValue={(value) => setFormData({ ...formData, planValue: `${value}` })}
                      disabled={saving}
                      placeholder="Digite o valor do plano"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractNumber" className="text-[hsl(var(--foreground))]">
                      Contrato nº
                    </Label>
                    <Input
                      id="contractNumber"
                      value={formData.contractNumber}
                      onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                      disabled={saving}
                      placeholder="Ex: 028/2025"
                    />
                  </div>

                  <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
                    <StSelect 
                      htmlFor= 'consultant'
                      value={formData.consultantId || 'none'}
                      onChange={(value: string) => setFormData({ ...formData, consultantId: value === 'none' ? '' : value })}
                      loading={saving || isConsultant}
                      items={consultants.map((consultant) => ({ id: consultant.id, description: consultant.name }))}
                      label='Consultor Responsável'
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      label='Data de Início'
                      date
                      id='contractStartDate'
                      value={formData.contractStartDate}
                      onChangeValue={(value) => setFormData({ ...formData, contractStartDate: `${value}` })}
                      disabled={saving}
                      htmlFor='contractStartDate'
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      label='Data de Fim'
                      date
                      id='contractEndDate'
                      value={formData.contractEndDate}
                      onChangeValue={(value) => setFormData({ ...formData, contractEndDate: `${value}` })}
                      disabled={saving}
                      htmlFor='contractEndDate'
                    />
                  </div>

                    <div className="space-y-2">
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
                </div>

                {/* Sector 3: Contato */}
                <div className="space-y-4">
                  <SessionTitle title="Contato" subTitle="Informações de contato e localização" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
                    <FormField
                      label="Telefone / WhatsApp"
                      htmlFor="contact"
                      id="contact"
                      value={formData.contact}
                      onChangeValue={(value) => setFormData({ ...formData, contact: `${value}` })}
                      disabled={saving}
                      phone
                    />
                  </div>

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

                  <div className="space-y-2">
                    <StSelect
                      htmlFor='country'
                      label='País'
                      value={formData.countryId}
                      onChange={handleCountryChange}
                      loading={saving || loadingCountries}
                      items={countries.map((c) => ({ id: c.id, description: c.name }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <StSelect
                      htmlFor='state'
                      label='Estado (UF)'
                      value={formData.stateId}
                      onChange={handleStateChange}
                      loading={saving || loadingStates || !formData.countryId}
                      items={states.map((s) => ({ id: s.id, description: `${s.name} (${s.code})` }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <StSelect
                      htmlFor='city'
                      label='Cidade'
                      value={formData.cityId}
                      onChange={(value: string) => setFormData({ ...formData, cityId: value })}
                      loading={saving || loadingCities || !formData.stateId}
                      items={cities.map((c) => ({ id: c.id, description: c.name }))}
                    />
                  </div>

                  <div className="space-y-2">
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
                </div>

                {/* Sector 4: Prospecção e Origem */}
                <div className="space-y-4">
                  <SessionTitle title="Prospecção e Origem" subTitle="Origem e informações profissionais" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
                    <FormField
                      label="Profissão / Atividade"
                      htmlFor="profession"
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      disabled={saving}
                      placeholder="Ex: Médico, Empresário, Autônomo"
                    />
                  </div>

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