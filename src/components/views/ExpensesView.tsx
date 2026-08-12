import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { formatCurrency, formatKm, formatDateShort } from '../../utils/formatters';
import { calculateVehicleOverview } from '../../utils/vehicleCalculations';
import { DollarSign, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';

interface ExpensesViewProps {
  onOpenAddModal: (data?: Expense | null) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddModal }) => {
  const { activeVehicle, expenses, deleteExpense, maintenances } = useApp();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!activeVehicle) return null;

  const vehicleExpenses = expenses.filter((e) => e.vehicleId === activeVehicle.id);
  vehicleExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const overview = calculateVehicleOverview(
    activeVehicle,
    maintenances,
    expenses,
    []
  );

  // Group monthly expenses by category for breakdown
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = vehicleExpenses.filter((e) => {
    const d = new Date(e.date);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const categoryTotals: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const totalCurrentMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Control de Gastos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Mantené un registro detallado de todo lo que invertís en {activeVehicle.brand} {activeVehicle.model}
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal(null)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + Registrar Gasto
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Este Mes ({new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(now)})
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(overview.monthlyExpenses)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Incluye combustible y mantenimientos</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Acumulado Año {currentYear}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(overview.annualExpenses)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total registrado este año</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Costo por Kilómetro
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {overview.costPerKm !== null ? `${formatCurrency(overview.costPerKm)} / km` : 'Sin datos'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {overview.costPerKm !== null
              ? 'Calculado en base al uso real'
              : 'Todavía no tenemos suficiente información para calcularlo.'}
          </p>
        </div>
      </div>

      {/* Resumen mensual por categoría */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">
            Desglose del Mes Actual
          </h3>

          <div className="space-y-2.5">
            {Object.entries(categoryTotals).map(([cat, amount]) => {
              const pct = totalCurrentMonth > 0 ? Math.round((amount / totalCurrentMonth) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span>{formatCurrency(amount)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses History List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-base">Historial de Gastos</h3>
          <span className="text-xs text-slate-500 font-medium">{vehicleExpenses.length} registros</span>
        </div>

        {vehicleExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">Todavía no registraste gastos.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Agregá cargas de combustible, seguro, peajes o estacionamiento.</p>
            <button
              onClick={() => onOpenAddModal(null)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
            >
              Registrar gasto
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {vehicleExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
                      {expense.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {formatDateShort(expense.date)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{expense.description}</p>
                  {expense.mileage && (
                    <p className="text-[11px] text-slate-400">{formatKm(expense.mileage)}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-slate-900 text-sm sm:text-base">
                    {formatCurrency(expense.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAddModal(expense)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(expense.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">¿Seguro que querés eliminar este gasto?</h3>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition text-xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
