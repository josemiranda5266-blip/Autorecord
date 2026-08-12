import React from 'react';
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
} from 'lucide-react';
import { TabType } from '../navigation/Navbar';

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
  } = useApp();

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

  return (
    <div className="space-y-6 pb-12">
      {/* 1. VEHÍCULO SELECCIONADO CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Subtle Gradient & Accents */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{activeVehicle.licensePlate || 'Sin patente'}</span>
              <span>•</span>
              <span>{activeVehicle.year}</span>
              <span>•</span>
              <span>{activeVehicle.fuelType}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-1">
              {activeVehicle.brand} {activeVehicle.model} {activeVehicle.version}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Motor: {activeVehicle.engine} • Odómetro: <strong className="text-white">{formatKm(activeVehicle.currentMileage)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenMileageModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Gauge className="w-4 h-4" />
              + Actualizar km
            </button>
          </div>
        </div>
      </div>

      {/* 2. ESTADO DEL VEHÍCULO */}
      <div
        className={`rounded-3xl p-5 border shadow-sm transition-all flex items-start gap-4 ${
          overview.status === 'overdue'
            ? 'bg-red-50/90 border-red-200 text-red-950'
            : overview.status === 'upcoming'
            ? 'bg-amber-50/90 border-amber-200 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="p-3 rounded-2xl shrink-0 mt-0.5">
          {overview.status === 'overdue' && (
            <div className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-red-600/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
          )}
          {overview.status === 'upcoming' && (
            <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          {overview.status === 'ok' && (
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg tracking-tight">{overview.statusTitle}</h3>
            <button
              onClick={onOpenPlanModal}
              className="text-[11px] font-bold text-blue-700 hover:underline hidden sm:inline"
            >
              Ver Plan de Referencia
            </button>
          </div>
          <p className="text-xs font-medium opacity-90 mt-0.5">{overview.statusSubtitle}</p>
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
            {overview.nextMaintenance?.type || 'Todo al día'}
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

        {/* Próximo Vencimiento */}
        <div
          onClick={() => setActiveTab('documents')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              📅 Vencimiento
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
            {overview.nextDocument?.title || 'Documentos en regla'}
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
            {overview.nextDocument?.detail || 'Sin vencimientos'}
          </div>
        </div>

        {/* Gastos del mes */}
        <div
          onClick={() => setActiveTab('expenses')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              💰 Gastos del mes
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-slate-900 text-lg sm:text-xl">
            {formatCurrency(overview.monthlyExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Este mes actual</div>
        </div>

        {/* Kilometraje */}
        <div
          onClick={onOpenMileageModal}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              📊 Kilometraje
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-slate-900 text-lg sm:text-xl">
            {formatKm(activeVehicle.currentMileage)}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            + Tocar para actualizar
          </div>
        </div>
      </div>

      {/* 4. CONSEJO PARA VOS (CONSEJOS PERSONALIZADOS) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>💡 Consejo para vos ({activeVehicle.brand} {activeVehicle.model})</span>
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

      {/* 5. ACCIONES RÁPIDAS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Acciones Rápidas
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onOpenAddModal('maintenance')}
            className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-blue-100"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            + Mantenimiento
          </button>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-emerald-100"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            + Gasto
          </button>

          <button
            onClick={onOpenMileageModal}
            className="p-3.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-amber-100"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            + Kilometraje
          </button>

          <button
            onClick={() => onOpenAddModal('document')}
            className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-indigo-100"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            + Documento
          </button>
        </div>
      </div>
    </div>
  );
};
