'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DateInput } from '@/components/ui/date-input';
import { SessionTitle } from '@/components/ui/session-title';
import { StSelect } from './st-select';
import { FormField } from './ui/form-field';
import { YesNoField } from './yes-no-field';
import { StTable } from './st-table';
import { formatCurrency } from '@/lib/utils';
import { StTableActions } from './st-table-actions';

interface Property {
  id: string;
  propertyType: string;
  address: string;
  marketValue: number;
  lastAppraisalDate?: string;
  isFinanced: boolean;
  notes?: string;
}

interface Vehicle {
  id: string;
  vehicleType: string;
  model: string;
  year?: number;
  estimatedValue: number;
  notes?: string;
}

interface ValuableAsset {
  id: string;
  description: string;
  category: string;
  estimatedValue: number;
  notes?: string;
}

interface PropertyForm {
  propertyType: string;
  address: string;
  marketValue: string;
  lastAppraisalDate: string;
  isFinanced: boolean;
  notes: string;
}

interface VehicleForm {
  vehicleType: string;
  model: string;
  year: string;
  estimatedValue: string;
  notes: string;
}

interface ValuableAssetForm {
  description: string;
  category: string;
  estimatedValue: string;
  notes: string;
}

interface PatrimonySectionProps {
  properties: Property[];
  vehicles: Vehicle[];
  valuableAssets: ValuableAsset[];
  
  showPropertyForm: boolean;
  propertyForm: PropertyForm;
  editingPropertyId: string | null;
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onSaveProperty: () => void;
  onDeleteProperty: (id: string) => void;
  onCancelPropertyForm: () => void;
  setPropertyForm: (form: PropertyForm) => void;
  
  showVehicleForm: boolean;
  vehicleForm: VehicleForm;
  editingVehicleId: string | null;
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onSaveVehicle: () => void;
  onDeleteVehicle: (id: string) => void;
  onCancelVehicleForm: () => void;
  setVehicleForm: (form: VehicleForm) => void;
  
  showValuableAssetForm: boolean;
  valuableAssetForm: ValuableAssetForm;
  editingValuableAssetId: string | null;
  onAddValuableAsset: () => void;
  onEditValuableAsset: (asset: ValuableAsset) => void;
  onSaveValuableAsset: () => void;
  onDeleteValuableAsset: (id: string) => void;
  onCancelValuableAssetForm: () => void;
  setValuableAssetForm: (form: ValuableAssetForm) => void;
}

const PROPERTY_TYPES = ['Casa', 'Apartamento', 'Terreno', 'Ponto Comercial', 'Imóvel Rural', 'Outro'];
const VEHICLE_TYPES = [
  'Carro', 'Moto', 'Caminhonete/Pickup', 'SUV', 'Caminhão', 'Ônibus/Micro-ônibus',
  'Van', 'Utilitário Leve', 'Trator', 'Máquinas Agrícolas', 'Barco', 'Lancha', 'Jet Ski', 'Outro'
];
const VALUABLE_ASSET_CATEGORIES = ['Joia', 'Equipamento', 'Instrumento', 'Arte', 'Outro'];

export function PatrimonySection(props: PatrimonySectionProps) {
  const {
    properties, vehicles, valuableAssets,
    showPropertyForm, propertyForm, editingPropertyId,
    onAddProperty, onEditProperty, onSaveProperty, onDeleteProperty, onCancelPropertyForm, setPropertyForm,
    showVehicleForm, vehicleForm, editingVehicleId,
    onAddVehicle, onEditVehicle, onSaveVehicle, onDeleteVehicle, onCancelVehicleForm, setVehicleForm,
    showValuableAssetForm, valuableAssetForm, editingValuableAssetId,
    onAddValuableAsset, onEditValuableAsset, onSaveValuableAsset, onDeleteValuableAsset, onCancelValuableAssetForm, setValuableAssetForm
  } = props;

  return (
    <>
      {/* Imóveis Section */}
      <div className="space-y-4">
        <SessionTitle title="Imóveis" />
        
        {properties.length > 0 && (
          <div className="overflow-x-auto">
            <StTable 
                colunmNames={['Tipo', 'Endereço', 'Valor', 'Financiado', 'Ações']}
                items={properties.map(p => ({ propertyType: p.propertyType, 
                                            address: p.address, 
                                            marketValue: formatCurrency(p.marketValue), 
                                            isFinanced: p.isFinanced ? 'Sim' : 'Não',
                                            actions: <StTableActions onEdit={() => onEditProperty(p)} onDelete={() => onDeleteProperty(p.id)} />
                                        }))}
                subTotals={<tr className="font-medium bg-[hsl(var(--card-accent))]/40">
                                <td colSpan={2} className="py-3 px-3 text-sm text-[hsl(var(--foreground))]">Subtotal Imóveis</td>
                                <td className="pl-6 py-3 px-3 text-md font-bold text-[hsl(var(--foreground))]">
                                {formatCurrency(properties.reduce((sum, p) => sum + p.marketValue, 0))}
                                </td>
                                <td></td>
                                <td></td>
                            </tr>}
            />
          </div>
        )}
        
        {showPropertyForm && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg space-y-4">
            <h4 className="font-medium text-slate-800 dark:text-white">{editingPropertyId ? 'Editar Imóvel' : 'Adicionar Imóvel'}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StSelect 
                    htmlFor='propertyType'
                    label='Tipo do Imóvel'
                    required
                    searchable={false}
                    value={propertyForm.propertyType}
                    onChange={(value) => setPropertyForm({ ...propertyForm, propertyType: value })}
                    items={PROPERTY_TYPES.map(type => ({ id: type, description: type }))}
                    loading={false}
                />

                <FormField
                    htmlFor='address'
                    label='Endereço'
                    required
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                />

                 <FormField
                    htmlFor='marketValue'
                    label='Valor de Mercado'
                    required
                    currency
                    value={propertyForm.marketValue}
                    onChangeValue={(value) => setPropertyForm({ ...propertyForm, marketValue: value.toString() })}
                />

                <FormField
                    htmlFor='lastAppraisalDate'
                    label='Data da Última Avaliação'
                    required
                    date
                    value={propertyForm.lastAppraisalDate}
                    onChangeValue={(value) => setPropertyForm({ ...propertyForm, lastAppraisalDate: value.toString() })}
                />

                <YesNoField 
                    id='isFinanced'
                    label='Financiado?'
                    value={propertyForm.isFinanced ? 'true' : 'false'}
                    onValueChange={(value) => setPropertyForm({ ...propertyForm, isFinanced: value })}
                />

                <FormField
                    htmlFor='observations'
                    label='Observações'
                    textArea
                    value={propertyForm.notes}
                    onChangeTextArea={(e) => setPropertyForm({ ...propertyForm, notes: e.target.value })}
                />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={onSaveProperty} size="sm">Salvar</Button>
              <Button type="button" variant="outline" onClick={onCancelPropertyForm} size="sm">Cancelar</Button>
            </div>
          </div>
        )}
        
        {!showPropertyForm && (
          <Button type="button" variant="outline" size="sm" onClick={onAddProperty}>
            Adicionar Imóvel
          </Button>
        )}
      </div>

      {/* Veículos Section */}
      <div className="space-y-4">
        <SessionTitle title="Veículos" />
        
        {vehicles.length > 0 && (
          <div className="overflow-x-auto">
            <StTable 
                colunmNames={['Tipo', 'Modelo', 'Ano', 'Valor Estimado', 'Ações']}
                items={vehicles.map(v => ({ type: v.vehicleType, 
                                            model: v.model, 
                                            year: v.year, 
                                            estimatedValue: formatCurrency(v.estimatedValue), 
                                            actions: <StTableActions onEdit={() => onEditVehicle(v)} onDelete={() => onDeleteVehicle(v.id)} />
                                        }))}
                subTotals={<tr className="font-medium bg-[hsl(var(--card-accent))]/40">
                                <td colSpan={3} className="py-3 px-3 text-sm text-[hsl(var(--foreground))]">Subtotal Veículos</td>
                                <td className="pl-6 py-3 px-3 text-md font-bold text-[hsl(var(--foreground))]">
                                {formatCurrency(vehicles.reduce((sum, v) => sum + v.estimatedValue, 0))}
                                </td>
                                <td></td>
                            </tr>}
            />
          </div>
        )}
        
        {showVehicleForm && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg space-y-4">
            <h4 className="font-medium text-slate-800 dark:text-white">{editingVehicleId ? 'Editar Veículo' : 'Adicionar Veículo'}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <StSelect 
                    htmlFor='vehicleType'
                    label='Tipo do Veículo'
                    required
                    searchable={false}
                    value={vehicleForm.vehicleType}
                    onChange={(value) => setVehicleForm({ ...vehicleForm, vehicleType: value })}
                    items={VEHICLE_TYPES.map(type => ({ id: type, description: type }))}
                    loading={false}
                />

                <FormField
                    htmlFor='vehicleModel'
                    label='Modelo'
                    required
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                />

                 <FormField
                    htmlFor='vehicleYear'
                    label='Ano'
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    placeholder="Ex: 2023"
                />

                <FormField
                    htmlFor='estimatedValue'
                    label='Valor Estimado'
                    required
                    currency
                    value={vehicleForm.estimatedValue}
                    onChangeValue={(value) => setVehicleForm({ ...vehicleForm, estimatedValue: `${value}` })}
                />

                <FormField
                    htmlFor='vehicleNotes'
                    label='Observações'
                    textArea
                    value={vehicleForm.notes}
                    onChangeTextArea={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={onSaveVehicle} size="sm">Salvar</Button>
              <Button type="button" variant="outline" onClick={onCancelVehicleForm} size="sm">Cancelar</Button>
            </div>
          </div>
        )}
        
        {!showVehicleForm && (
          <Button type="button" variant="outline" size="sm" onClick={onAddVehicle}>
            Adicionar Veículo
          </Button>
        )}
      </div>

      {/* Bens de Valor Section */}
      <div className="space-y-4">
        <SessionTitle title="Bens de Valor" />
        
        {valuableAssets.length > 0 && (
          <div className="overflow-x-auto">
             <StTable 
                colunmNames={['Descrição', 'Categoria', 'Valor Estimado', 'Ações']}
                items={valuableAssets.map(a => ({ description: a.description, 
                                            category: a.category, 
                                            estimatedValue: formatCurrency(a.estimatedValue), 
                                            actions: <StTableActions onEdit={() => onEditValuableAsset(a)} onDelete={() => onDeleteValuableAsset(a.id)} />
                                        }))}
                subTotals={<tr className="font-medium bg-[hsl(var(--card-accent))]/40">
                                <td colSpan={2} className="py-3 px-3 text-sm text-[hsl(var(--foreground))]">Subtotal Bens de Valor</td>
                                <td className="pl-6 py-3 px-3 text-md font-bold text-[hsl(var(--foreground))]">
                                {formatCurrency(valuableAssets.reduce((sum, a) => sum + a.estimatedValue, 0))}
                                </td>
                                <td></td>
                            </tr>}
            />
          </div>
        )}
        
        {showValuableAssetForm && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg space-y-4">
            <h4 className="font-medium text-slate-800 dark:text-white">{editingValuableAssetId ? 'Editar Bem de Valor' : 'Adicionar Bem de Valor'}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    htmlFor='valuableDescription'
                    label='Descrição'
                    required
                    value={valuableAssetForm.description}
                    onChange={(e) => setValuableAssetForm({ ...valuableAssetForm, description: e.target.value })}
                />

                <StSelect 
                    htmlFor='valuableCategory'
                    label='Categoria'
                    required
                    searchable={false}
                    value={valuableAssetForm.category}
                    onChange={(value) => setValuableAssetForm({ ...valuableAssetForm, category: value })}
                    items={VALUABLE_ASSET_CATEGORIES.map(category => ({ id: category, description: category }))}
                    loading={false}
                />

                <FormField
                    htmlFor='valuableEstimatedValue'
                    label='Valor Estimado'
                    required
                    currency
                    value={valuableAssetForm.estimatedValue}
                    onChangeValue={(value) => setValuableAssetForm({ ...valuableAssetForm, estimatedValue: `${value}` })}
                />

                 <FormField
                    htmlFor='valuableNotes'
                    label='Observações'
                    textArea
                    value={valuableAssetForm.notes}
                    onChangeTextArea={(e) => setValuableAssetForm({ ...valuableAssetForm, notes: e.target.value })}
                />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={onSaveValuableAsset} size="sm">Salvar</Button>
              <Button type="button" variant="outline" onClick={onCancelValuableAssetForm} size="sm">Cancelar</Button>
            </div>
          </div>
        )}
        
        {!showValuableAssetForm && (
          <Button type="button" variant="outline" size="sm" onClick={onAddValuableAsset}>
            Adicionar Bem de Valor
          </Button>
        )}
      </div>

      {/* Total Patrimônio */}
      <div className="pt-4 border-t-2 border-[hsl(var(--border))] mt-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-[hsl(var(--foreground-accent))]">
            Total Bens de Valor
          </span>
          <span className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {formatCurrency(
              properties.reduce((sum, p) => sum + p.marketValue, 0) +
              vehicles.reduce((sum, v) => sum + v.estimatedValue, 0) +
              valuableAssets.reduce((sum, a) => sum + a.estimatedValue, 0)
            )}
          </span>
        </div>
      </div>
    </>
  );
}
