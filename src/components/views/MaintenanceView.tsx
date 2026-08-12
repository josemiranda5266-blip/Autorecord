import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceItem, UrgencyLevel } from '../../types';
import { formatCurrency, formatKm, formatDateShort } from '../../utils/formatters';
import { calculateMaintenanceUrgency, getUrgencyInfo } from '../../utils/vehicleCalculations';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  BookOpen,
  Filter,
  ArrowUpDown,
  ShieldAlert,
  AlertCircle,
  Info,
  Check,
} from 'lucide-react';

interface MaintenanceViewProps {
  onOpenAddModal: (data?: MaintenanceItem | null) => void;
  onOpenPlanModal: () => void;
}

export type MaintenanceFilterType =
  | 'all'
  | 'critical'
  | 'urgent'
  | 'important'
  | 'preventive'
  | 'informative'
  | 'overdue'
  | 'upcoming'
  | 'completed';

export type MaintenanceSortType = 'urgency' | 'date' | 'mileage' | 'category';

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  onOpenAddModal,
  onOpenPlanModal,
}) => {
  const {
    activeVehicle,
    maintenances,
    deleteMaintenance,
    toggleMaintenanceComplete,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<MaintenanceFilterType>('all');
  const [sortBy, setSortBy] = useState<MaintenanceSortType>('urgency');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!activeVehicle) return null;

  const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === activeVehicle.id);

  // Calculate urgency for each item
  const enrichedItems = vehicleMaintenances.map((item) => {
    const urgencyCalc = calculateMaintenanceUrgency(item, activeVehicle.currentMileage);
    const urgencyInfo = getUrgencyInfo(urgencyCalc.level);
    return {
      ...item,
      urgencyLevel: urgencyCalc.level,
      urgencyInfo,
      urgencyReason: urgencyCalc.reason,
      remainingKm: urgencyCalc.remainingKm,
      remainingDays: urgencyCalc.remainingDays,
    };
  });

  // Apply Filter
  const filteredItems = enrichedItems.filter((item) => {
    if (activeFilter === 'completed') return item.isCompleted;
    if (item.isCompleted && activeFilter !== 'all') return false;

    switch (activeFilter) {
      case 'critical':
        return item.urgencyLevel === 5;
      case 'urgent':
        return item.urgencyLevel === 4;
      case 'important':
        return item.urgencyLevel === 3;
      case 'preventive':
        return item.urgencyLevel === 2;
      case 'informative':
        return item.urgencyLevel === 1;
      case 'overdue':
        return item.urgencyLevel >= 4;
      case 'upcoming':
        return item.urgencyLevel === 2 || item.urgencyLevel === 3;
      case 'all':
      default:
        return true;
    }
  });

  // Apply Sorting
  filteredItems.sort((a, b) => {
    if (sortBy === 'urgency') {
      if (b.urgencyLevel !== a.urgencyLevel) {
        return b.urgencyLevel - a.urgencyLevel;
      }
      return (a.remainingKm ?? 999999) - (b.remainingKm ?? 999999);
    }
    if (sortBy === 'date') {
      const dateA = new Date(a.nextDateDue || a.date).getTime();
      const dateB = new Date(b.nextDateDue || b.date).getTime();
      return dateA - dateB;
    }
    if (sortBy === 'mileage') {
      const kmA = a.nextMileageDue || a.mileage;
      const kmB = b.nextMileageDue || b.mileage;
      return kmA - kmB;
    }
    if (sortBy === 'category') {
      return a.type.localeCompare(b.type);
    }
    return 0;
  });

  // Count summaries for pill badges
  const criticalCount = enrichedItems.filter((i) => !i.isCompleted && i.urgencyLevel === 5).length;
  const urgentCount = enrichedItems.filter((i) => !i.isCompleted && i.urgencyLevel === 4).length;
  const importantCount = enrichedItems.filter((i) => !i.isCompleted && i.urgencyLevel === 3).length;
  const preventiveCount = enrichedItems.filter((i) => !i.isCompleted && i.urgencyLevel === 2).length;
  const informativeCount = enrichedItems.filter((i) => !i.isCompleted && i.urgencyLevel === 1).length;
  const overdueCount = enrichedItems.filter((i) => !i.isCompleted && i.urgencyLevel >= 4).length;
  const upcomingCount = enrichedItems.filter((i) => !i.isCompleted && (i.urgencyLevel === 2 || i.urgencyLevel === 3)).length;
  const completedCount = enrichedItems.filter((i) => i.isCompleted).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            Mantenimiento Preventivo
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Mantenimiento estructurado y control preventivo para {activeVehicle.brand} {activeVehicle.model} ({formatKm(activeVehicle.currentMileage)})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenPlanModal}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Plan Mantenimiento</span>
          </button>

          <button
            onClick={() => onOpenAddModal(null)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Registrar Mantenimiento
          </button>
        </div>
      </div>

      {/* FILTER & SORT CONTROLS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtrar por:</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as MaintenanceSortType)}
              className="bg-slate-100 font-bold text-slate-800 rounded-xl px-2.5 py-1.5 border-0 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="urgency">Prioridad / Urgencia</option>
              <option value="date">Próxima Fecha</option>
              <option value="mileage">Próximo Kilometraje</option>
              <option value="category">Categoría</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Grid */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({enrichedItems.length})
          </button>

          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            🔴 Críticas ({criticalCount})
          </button>

          <button
            onClick={() => setActiveFilter('urgent')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'urgent'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            🟠 Urgentes ({urgentCount})
          </button>

          <button
            onClick={() => setActiveFilter('important')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'important'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🟡 Importantes ({importantCount})
          </button>

          <button
            onClick={() => setActiveFilter('preventive')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'preventive'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            🔵 Preventivas ({preventiveCount})
          </button>

          <button
            onClick={() => setActiveFilter('informative')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'informative'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⚪ Informativas ({informativeCount})
          </button>

          <button
            onClick={() => setActiveFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'overdue'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-red-100/80 text-red-800 hover:bg-red-200'
            }`}
          >
            ⚠️ Vencidas ({overdueCount})
          </button>

          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'upcoming'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200'
            }`}
          >
            ⏳ Próximas ({upcomingCount})
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ✅ Completadas ({completedCount})
          </button>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 my-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Sin mantenimientos en esta categoría</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hay tareas registradas que coincidan con los filtros seleccionados.
            </p>
            <button
              onClick={() => onOpenAddModal(null)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition"
            >
              + Registrar Mantenimiento
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.isCompleted
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : item.urgencyLevel === 5
                  ? 'bg-red-50/90 border-red-200/90 hover:border-red-300'
                  : item.urgencyLevel === 4
                  ? 'bg-orange-50/90 border-orange-200/90 hover:border-orange-300'
                  : item.urgencyLevel === 3
                  ? 'bg-amber-50/90 border-amber-200/90 hover:border-amber-300'
                  : item.urgencyLevel === 2
                  ? 'bg-blue-50/90 border-blue-200/90 hover:border-blue-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status / Urgency Badge */}
                  {item.isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                      <Check className="w-3 h-3" /> REALIZADO
                    </span>
                  ) : (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${item.urgencyInfo.badgeBg}`}
                    >
                      NIVEL {item.urgencyLevel} — {item.urgencyInfo.label}
                    </span>
                  )}

                  {/* Safety badge */}
                  {item.isSafetyComponent && (
                    <span className="px-2 py-0.5 bg-slate-900 text-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      Seguridad
                    </span>
                  )}

                  <span className="text-xs font-semibold text-slate-500">
                    • {item.type === 'Otro' && item.customType ? item.customType : item.type}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base">
                  {item.description || item.type}
                </h3>

                <p className="text-xs text-slate-700 font-medium">
                  <strong>Estado / Motivo:</strong> {item.urgencyReason}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  {item.nextMileageDue && (
                    <span>Próximo Odómetro: <strong>{formatKm(item.nextMileageDue)}</strong></span>
                  )}
                  {item.nextDateDue && (
                    <span>Próxima Fecha: <strong>{formatDateShort(item.nextDateDue)}</strong></span>
                  )}
                  {item.cost > 0 && (
                    <span>Costo Registrado: <strong>{formatCurrency(item.cost)}</strong></span>
                  )}
                  {item.workshop && (
                    <span>Taller: <strong>{item.workshop}</strong></span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 justify-end">
                <button
                  onClick={() => toggleMaintenanceComplete(item.id)}
                  className={`px-3.5 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                    item.isCompleted
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {item.isCompleted ? 'Desmarcar' : 'Marcar Realizado'}
                </button>

                <button
                  onClick={() => onOpenAddModal(item)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">¿Seguro que querés eliminar este registro?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Esta acción eliminará permanentemente la información de este mantenimiento.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteMaintenance(deleteConfirmId);
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
