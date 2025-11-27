'use client';

import { Button } from '@/components/ui/button';
import { SessionTitle } from '@/components/ui/session-title';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { StSelect } from './st-select';
import { FormField } from './ui/form-field';
import { Categories } from './Categories';
import { StTable } from './st-table';
import { Category, MonthlyBudget, UserTransactionType } from '@/app/clientes/[id]/page';

interface MonthlyBudgetsSectionProps {
  clientId: string;
  isClient?: boolean;
  budgets: MonthlyBudget[];
  showBudgetForm: boolean;
  budgetForm: {
    categoryId: string;
    subcategoryId: string;
    budgetType: 'teto' | 'piso';
    amount: string;
  };
  editingBudgetId: string | null;
  onAddBudget: () => void;
  onEditBudget: (budget: MonthlyBudget) => void;
  onSaveBudget: () => void;
  onDeleteBudget: (id: string) => void;
  onCancelBudgetForm: () => void;
  setBudgetForm: (form: {
    categoryId: string;
    subcategoryId: string;
    budgetType: 'teto' | 'piso';
    amount: string;
  }) => void;
}

export function MonthlyBudgetsSection(props: MonthlyBudgetsSectionProps) {
  const {
    clientId,
    budgets,
    showBudgetForm,
    budgetForm,
    editingBudgetId,
    isClient,
    onAddBudget,
    onEditBudget,
    onSaveBudget,
    onDeleteBudget,
    onCancelBudgetForm,
    setBudgetForm,
  } = props;

  const [categories, setCategories] = useState<Category[]>([]);
  const [userTransactionTypes, setUserTransactionTypes] = useState<UserTransactionType[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ type: '', direction: 'Saída' as 'Entrada' | 'Saída' | 'Investimento' | 'Aporte' | 'Resgate', categoryId: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const [categoriesRes, userTypesRes] = await Promise.all([
        fetch(!isClient ? `/api/transaction-categories/user/${clientId}` : `/api/transaction-categories`),
        fetch(`/api/user-transaction-types?userId=${clientId}`)
      ]);
      
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }
      
      if (userTypesRes.ok) {
        const data = await userTypesRes.json();
        setUserTransactionTypes(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchCategories();
    }
  }, [clientId, showBudgetForm]);

  // Obter UserTransactionTypes de uma categoria
  const getUserTransactionTypes = (categoryId: string) => {
    return userTransactionTypes.filter(t => t.category.id === categoryId);
  };

  // Determinar tipo de budget baseado na categoria selecionada
  const selectedCategory = categories.find(c => c.id === budgetForm.categoryId);
  const budgetTypeLabel = selectedCategory?.defaultDirection === 'Investimento' ? 'Piso' : 'Teto';

  // Atualizar budgetType quando categoria mudar
  useEffect(() => {
    if (selectedCategory) {
      setBudgetForm({
        ...budgetForm,
        budgetType: selectedCategory.defaultDirection === 'Investimento' || selectedCategory.defaultDirection === 'Entrada' ? 'piso' : 'teto',
      });
    }
  }, [selectedCategory?.id]);

  const handleSaveCategory = async () => {
    if (!categoryForm.type) {
      toast.error('Preencha o tipo da subcategoria');
      return;
    }

    if (!categoryForm.categoryId) {
      toast.error('Selecione uma categoria');
      return;
    }

    try {
      const payload = {
        name: categoryForm.type, // Backend expects 'name' field
        direction: categoryForm.direction,
        userId: clientId,
        categoryId: categoryForm.categoryId,
      };

      const url = editingCategoryId
        ? `/api/user-transaction-types/${editingCategoryId}`
        : '/api/user-transaction-types';
      const method = editingCategoryId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingCategoryId ? 'Subcategoria atualizada!' : 'Subcategoria criada!');
        await fetchCategories();
        setCategoryForm({ type: '', direction: 'Saída', categoryId: '' });
        setEditingCategoryId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar subcategoria');
      }
    } catch (error) {
      toast.error('Erro ao salvar subcategoria');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta subcategoria?')) {
      return;
    }

    try {
      const res = await fetch(`/api/user-transaction-types/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Subcategoria removida!');
        await fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao remover subcategoria');
      }
    } catch (error) {
      toast.error('Erro ao remover subcategoria');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sessão: Tetos e Pisos Mensais */}
      <div>
          <SessionTitle 
            title={isClient ? "Meus objetivos mensais" : "Objetivos Mensais"}
            subTitle={isClient ? "Um passo de cada vez, defina e acompanhe seus objetivos mensais" : "Configure objetivos de gastos e de investimento"}
            leftContents={<div className="flex gap-2">
                            <Button
                              type="button"
                              variant="edit"
                              size="sm"
                              onClick={() => setShowCategoryManager(!showCategoryManager)}
                            >
                            <Settings className="h-4 w-4" />
                              {showCategoryManager ? 'Ocultar' : 'Gerenciar'} Categorias
                            </Button>
                            <Button type="button" size="sm" onClick={onAddBudget}>
                              {!showBudgetForm && <Plus className="h-4 w-4" />}
                              {showBudgetForm ? 'Cancelar' : 'Adicionar Teto/Piso' }
                            </Button>
                          </div>}
          />

        {/* Gerenciador de Categorias */}
        {showCategoryManager && (
          <Categories userId={clientId} isClient={isClient} />
        )}

        {/* Formulário de Teto/Piso */}
        {showBudgetForm && (
          <div className="bg-[hsl(var(--card))] p-4 rounded-lg mb-4 border border-[hsl(var(--app-border))]">
            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">
              {editingBudgetId ? 'Editar Teto/Piso' : 'Novo Teto/Piso'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <StSelect
                label="Categoria"
                required
                value={budgetForm.categoryId}
                onChange={(value) => setBudgetForm({ ...budgetForm, categoryId: value, subcategoryId: '' })}
                items={categories.map((cat) => ({ id: cat.id, description: `${cat.category} (${cat.defaultDirection})` }))}
                htmlFor='idCategory'
                loading={loadingCategories}
              />
              {budgetForm.categoryId && getUserTransactionTypes(budgetForm.categoryId).length > 0 &&
                <StSelect
                  label="Subcategoria"
                  value={budgetForm.subcategoryId}
                  onChange={(value) => setBudgetForm({ ...budgetForm, subcategoryId: value === 'None' ? '' : value })}
                  items={[
                    { id: 'None', description: 'Nenhuma' },
                    ...getUserTransactionTypes(budgetForm.categoryId).map((type) => ({ 
                      id: type.id, 
                      description: `${type.type} (${type.direction})` 
                    }))
                  ]}
                  htmlFor='idSubcategory'
                  loading={loadingCategories}
                />
              }

              <FormField
                label={`Valor do ${budgetTypeLabel}`}
                required
                htmlFor="budgetAmount"
                value={budgetForm.amount}
                currency
                onChangeValue={(value) => setBudgetForm({ ...budgetForm, amount: `${value}` })}
              />

            <div className="flex gap-2 items-end">
              <Button type="button" onClick={onSaveBudget}>
                {editingBudgetId ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancelBudgetForm}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Tabela de Tetos/Pisos */}
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
            Nenhum orçamento cadastrado
          </div>
        ) : (
          <StTable 
            colunmNames={['Categoria', 'Subcategoria', 'Tipo', 'Valor', 'Ações']}
            items={budgets.map((b) => ({
              name: <>{b.category.category}
                      <span className="ml-2 text-xs px-2 py-1 rounded bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                        {b.category.defaultDirection}
                      </span>
                    </>,
              subname: b.subcategory ? b.subcategory.type : '-',
              type: b.budgetType === 'piso' ? 'Poupar' : 'Gastar',
              amount: formatCurrency(b.amount),
              actions: (
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="edit"
                    onClick={() => onEditBudget(b)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteBudget(b.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            }))}
          />
        )}
      </div>
    </div>
  );
}
