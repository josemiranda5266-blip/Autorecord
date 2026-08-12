import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceItem } from '../../types';
import { formatCurrency, formatKm, formatDateShort } from '../../utils/formatters';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

interface MaintenanceViewProps {
  onOpenAddModal: (data?: MaintenanceItem | null) => void;
  onOpenPlanModal: () => void;
}

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

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!activeVehicle) return null;

  const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === activeVehicle.id);

  // Categorize items
  const pendingItems = vehicleMaintenances.filter((m) => !m.isCompleted);
  const completedItems = vehicleMaintenances.filter((m) => m.isCompleted);

  // Sort completed items chronologically descending
  completedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getItemStatusBadge = (item: MaintenanceItem) => {
    if (item.isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Realizado
        </span>
      );
    }

    if (item.nextMileageDue) {
      const remainingKm = item.nextMileageDue - activeVehicle.currentMileage;
      if (remainingKm < 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
            🔴 Vencido por {Math.abs(remainingKm).toLocaleString('es-AR')} km
          </span>
        );
      } else if (remainingKm <= 2000) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
            🟡 Próximo en {remainingKm.toLocaleString('es-AR')} km
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
            🟢 En {remainingKm.toLocaleString('es-AR')} km
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
        Pendiente
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            Mantenimiento
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Historial de servicios y tareas programadas para {activeVehicle.brand} {activeVehicle.model}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPlanModal}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Plan de Referencia</span>
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

      {/* Tabs Filter */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-6 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pendientes ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3 px-6 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Realizados ({completedItems.length})</span>
        </button>
      </div>

      {/* PENDING ITEMS LIST */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 my-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">¡Excelente! No tenés mantenimientos pendientes</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tu vehículo está al día. Si realizaste una intervención, podés registrarla para mantener tu historial actualizado.
              </p>
              <button
                onClick={() => onOpenAddModal(null)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition"
              >
                + Registrar Mantenimiento
              </button>
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{item.type}</h3>
                    {getItemStatusBadge(item)}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600">{item.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>Programado para: <strong>{formatKm(item.nextMileageDue || item.mileage)}</strong></span>
                    {item.nextDateDue && <span>Fecha: <strong>{formatDateShort(item.nextDateDue)}</strong></span>}
                    {item.workshop && <span>Taller: <strong>{item.workshop}</strong></span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 justify-end">
                  <button
                    onClick={() => toggleMaintenanceComplete(item.id)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Marcar Realizado
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
      )}

      {/* COMPLETED ITEMS HISTORY */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 my-4">
              <p className="text-sm font-semibold text-slate-700">Todavía no tenés mantenimientos realizados registrados.</p>
            </div>
          ) : (
            completedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {formatDateShort(item.date)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{item.type}</h3>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600">{item.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500 pt-1">
                    <span>Odómetro: <strong>{formatKm(item.mileage)}</strong></span>
                    {item.cost > 0 && <span>Costo: <strong className="text-slate-900">{formatCurrency(item.cost)}</strong></span>}
                    {item.workshop && <span>Taller: {item.workshop}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 justify-end">
                  <button
                    onClick={() => onOpenAddModal(item)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
