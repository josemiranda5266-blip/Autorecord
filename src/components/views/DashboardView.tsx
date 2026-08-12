import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateVehicleOverview } from '../../utils/vehicleCalculations';
import { formatCurrency, formatKm } from '../../utils/formatters';
import {
  Wrench,
  Calendar,
  DollarSign,
  Gauge,
  Lightbulb,
  Plus,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Car,
  AlertCircle,
  Info,
  ShieldCheck,
  ListFilter,
  Check,
} from 'lucide-react';
import { TabType } from '../navigation/Navbar';
import { UrgencyLevel, PreventiveRecommendation } from '../../types';

interface DashboardViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenAddModal: (type: 'maintenance' | 'expense' | 'document' | 'vehicle') => void;
  onOpenMileageModal: () => void;
  onOpenPlanModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddModal,
  onOpenMileageModal,
  onOpenPlanModal,
}) => {
  const {
    activeVehicle,
    vehicles,
    maintenances,
    expenses,
    documents,
    toggleMaintenanceComplete,
  } = useApp();

  const [urgencyFilter, setUrgencyFilter] = useState<number | 'all'>('all');

  if (!activeVehicle) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-lg">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Todavía no tenés ningún vehículo</h3>
        <p className="text-xs text-slate-500 mb-6">
          Agregá tu auto para comenzar a controlar su mantenimiento, gastos y vencimientos.
        </p>
        <button
          onClick={() => onOpenAddModal('vehicle')}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar mi vehículo
        </button>
      </div>
    );
  }

  const overview = calculateVehicleOverview(
    activeVehicle,
    maintenances,
    expenses,
    documents
  );

  const filteredPriorities = overview.priorities.filter((p) => {
    if (urgencyFilter === 'all') return true;
    return p.urgency === urgencyFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. VEHÍCULO SELECCIONADO CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{activeVehicle.licensePlate || 'Sin patente'}</span>
              <span>•</span>
              <span>{activeVehicle.year}</span>
              <span>•</span>
              <span>{activeVehicle.fuelType}</span>
              {activeVehicle.transmission && (
                <>
                  <span>•</span>
                  <span>{activeVehicle.transmission}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-1">
              {activeVehicle.brand} {activeVehicle.model} {activeVehicle.version}
            </h2>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-2 flex-wrap">
              <span>Motor: <strong className="text-white">{activeVehicle.engine} {activeVehicle.displacement ? `(${activeVehicle.displacement})` : ''}</strong></span>
              <span>•</span>
              <span>Odómetro: <strong className="text-white">{formatKm(activeVehicle.currentMileage)}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenMileageModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-98"
            >
              <Gauge className="w-4 h-4" />
              Actualizar km
            </button>
          </div>
        </div>
      </div>

      {/* 2. INDICADOR GENERAL DEL ESTADO DEL VEHÍCULO */}
      <div
        className={`rounded-3xl p-5 border shadow-xs transition-all flex items-start gap-4 ${overview.indicatorBadgeClass}`}
      >
        <div className="p-3 rounded-2xl shrink-0 mt-0.5">
          {overview.criticalCount > 0 ? (
            <div className="w-11 h-11 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-red-600/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
          ) : overview.urgentCount > 0 ? (
            <div className="w-11 h-11 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-600/30">
              <AlertCircle className="w-6 h-6" />
            </div>
          ) : overview.importantCount > 0 ? (
            <div className="w-11 h-11 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-11 h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="font-black text-lg tracking-tight">{overview.statusTitle}</h3>
            <button
              onClick={onOpenPlanModal}
              className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline shrink-0"
            >
              Plan Mantenimiento
            </button>
          </div>
          <p className="text-xs font-medium opacity-90 mt-1">{overview.statusSubtitle}</p>

          {/* Quick counts breakdown */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current/10 text-[11px] font-bold flex-wrap">
            {overview.criticalCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                🔴 {overview.criticalCount} Crítico(s)
              </span>
            )}
            {overview.urgentCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white">
                🟠 {overview.urgentCount} Urgente(s)
              </span>
            )}
            {overview.importantCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                🟡 {overview.importantCount} Importante(s)
              </span>
            )}
            {overview.preventiveCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                🔵 {overview.preventiveCount} Preventivo(s)
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              ✅ {overview.completedCount} Completados
            </span>
          </div>
        </div>
      </div>

      {/* 3. RESUMEN EN 4 TARJETAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Próximo Mantenimiento */}
        <div
          onClick={() => setActiveTab('maintenance')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              🔧 Mantenimiento
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
            {overview.nextMaintenance?.type || 'Servicios al día'}
          </div>
          <div
            className={`text-xs font-semibold mt-1 ${
              overview.nextMaintenance?.status === 'overdue'
                ? 'text-red-600'
                : overview.nextMaintenance?.status === 'upcoming'
                ? 'text-amber-600'
                : 'text-slate-500'
            }`}
          >
            {overview.nextMaintenance?.detail || 'Sin pendientes'}
          </div>
        </div>

        {/* Próximo Vencimiento Documentos */}
        <div
          onClick={() => setActiveTab('documents')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              📅 Vencimientos
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
            {overview.nextDocument?.title || 'Documentos al día'}
          </div>
          <div
            className={`text-xs font-semibold mt-1 ${
              overview.nextDocument?.status === 'overdue'
                ? 'text-red-600'
                : overview.nextDocument?.status === 'upcoming'
                ? 'text-amber-600'
                : 'text-slate-500'
            }`}
          >
            {overview.nextDocument?.detail || 'En regla'}
          </div>
        </div>

        {/* Gastos acumulados */}
        <div
          onClick={() => setActiveTab('expenses')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              💰 Gastos
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-slate-900 text-lg sm:text-xl">
            {formatCurrency(overview.monthlyExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Gasto este mes</div>
        </div>

        {/* Kilometraje */}
        <div
          onClick={onOpenMileageModal}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              📊 Odómetro
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-slate-900 text-lg sm:text-xl">
            {formatKm(activeVehicle.currentMileage)}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            Actualizar lectura →
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN CENTRAL: PRIORIDADES DE MANTENIMIENTO */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ListFilter className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">
                PRIORIDADES DE MANTENIMIENTO
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Ordenadas automáticamente por nivel de urgencia preventiva (Crítico → Informativo).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
            <button
              onClick={() => setUrgencyFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                urgencyFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({overview.priorities.length})
            </button>
            {overview.criticalCount > 0 && (
              <button
                onClick={() => setUrgencyFilter(5)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  urgencyFilter === 5
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🔴 Críticas ({overview.criticalCount})
              </button>
            )}
            {overview.urgentCount > 0 && (
              <button
                onClick={() => setUrgencyFilter(4)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  urgencyFilter === 4
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                🟠 Urgentes ({overview.urgentCount})
              </button>
            )}
            {overview.importantCount > 0 && (
              <button
                onClick={() => setUrgencyFilter(3)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  urgencyFilter === 3
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                🟡 Importantes ({overview.importantCount})
              </button>
            )}
            {overview.preventiveCount > 0 && (
              <button
                onClick={() => setUrgencyFilter(2)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  urgencyFilter === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                🔵 Preventivas ({overview.preventiveCount})
              </button>
            )}
          </div>
        </div>

        {/* Priority List */}
        {filteredPriorities.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No hay recomendaciones con el filtro seleccionado</p>
            <p className="text-xs text-slate-500 mt-0.5">Tu vehículo está en excelente estado de mantenimiento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPriorities.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.urgency === 5
                    ? 'bg-red-50/80 border-red-200/90 hover:border-red-300'
                    : item.urgency === 4
                    ? 'bg-orange-50/80 border-orange-200/90 hover:border-orange-300'
                    : item.urgency === 3
                    ? 'bg-amber-50/80 border-amber-200/90 hover:border-amber-300'
                    : item.urgency === 2
                    ? 'bg-blue-50/80 border-blue-200/90 hover:border-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Urgency Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${item.urgencyInfo.badgeBg}`}
                    >
                      NIVEL {item.urgency} — {item.urgencyInfo.label}
                    </span>

                    {/* Safety Badge */}
                    {item.isSafetyComponent && (
                      <span className="px-2 py-0.5 bg-slate-900 text-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        Seguridad
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-slate-500">
                      • {item.category}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Motivo:</strong> {item.reason}
                  </p>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Right Action button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.maintenanceItemId ? (
                    <button
                      onClick={() => toggleMaintenanceComplete(item.maintenanceItemId!)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar Realizado
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenAddModal('maintenance')}
                      className={`px-3.5 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs ${
                        item.urgency >= 4
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {item.urgencyInfo.actionText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. CONSEJO PREVENTIVO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Consejo para vos ({activeVehicle.brand} {activeVehicle.model})</span>
        </div>
        <h4 className="text-lg font-black text-white">{overview.personalizedTip.title}</h4>
        <p className="text-xs text-slate-300 font-normal leading-relaxed mt-1.5">
          {overview.personalizedTip.content}
        </p>
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Categoría: <strong className="text-slate-200 uppercase">{overview.personalizedTip.category}</strong></span>
          <button
            onClick={() => setActiveTab('tips')}
            className="text-amber-400 hover:underline font-bold flex items-center gap-1"
          >
            Ver todos los consejos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. ACCIONES RÁPIDAS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Acciones Rápidas
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onOpenAddModal('maintenance')}
            className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-blue-100 active:scale-98"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            + Mantenimiento
          </button>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-emerald-100 active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            + Gasto
          </button>

          <button
            onClick={onOpenMileageModal}
            className="p-3.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-amber-100 active:scale-98"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            + Odómetro km
          </button>

          <button
            onClick={() => onOpenAddModal('document')}
            className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-indigo-100 active:scale-98"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            + Documento
          </button>
        </div>
      </div>
    </div>
  );
};
