import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { DollarSign, X, CheckCircle2 } from 'lucide-react';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Combustible',
  'Mantenimiento',
  'Reparación',
  'Seguro',
  'Impuestos',
  'Estacionamiento',
  'Lavado',
  'Neumáticos',
  'Accesorios',
  'Otros',
];

interface AddEditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Expense | null;
}

export const AddEditExpenseModal: React.FC<AddEditExpenseModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { activeVehicle, addExpense, updateExpense } = useApp();

  const [category, setCategory] = useState<ExpenseCategory>(
    initialData?.category || 'Combustible'
  );
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? String(initialData.amount) : ''
  );
  const [mileage, setMileage] = useState<string>(
    initialData?.mileage ? String(initialData.mileage) : activeVehicle ? String(activeVehicle.currentMileage) : ''
  );
  const [description, setDescription] = useState<string>(initialData?.description || '');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeVehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount.replace(/[^0-9.]/g, ''));
    const mileageNum = mileage ? parseInt(mileage.replace(/\D/g, ''), 10) : undefined;

    if (!category || !date || isNaN(amountNum) || amountNum <= 0) {
      setError('Por favor completá los campos obligatorios (*) con valores válidos.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateExpense(initialData.id, {
          category,
          date,
          amount: amountNum,
          mileage: mileageNum,
          description,
        });
      } else {
        await addExpense({
          vehicleId: activeVehicle.id,
          category,
          date,
          amount: amountNum,
          mileage: mileageNum,
          description: description || `Gasto de ${category}`,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl transition-all">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">
                {initialData ? 'Editar Gasto' : 'Registrar Gasto'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeVehicle.brand} {activeVehicle.model} ({activeVehicle.licensePlate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Categoría de Gasto <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Monto ($ ARS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 45000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kilometraje actual (Opcional)
            </label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder={`Ej: ${activeVehicle.currentMileage}`}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descripción / Notas
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Nafta Súper YPF / Cochera mensual"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-md shadow-emerald-500/20 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
