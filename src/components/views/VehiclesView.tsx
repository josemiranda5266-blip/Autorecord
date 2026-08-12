import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { formatKm } from '../../utils/formatters';
import { Car, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VehiclesViewProps {
  onOpenAddVehicleModal: (data?: Vehicle | null) => void;
  onOpenUpgradeModal: () => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  onOpenAddVehicleModal,
  onOpenUpgradeModal,
}) => {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    deleteVehicle,
    userPlan,
  } = useApp();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Mis Vehículos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Administrá todos los automóviles de tu flota personal ({vehicles.length} registrado{vehicles.length === 1 ? '' : 's'})
          </p>
        </div>

        <button
          onClick={() => {
            if (userPlan === 'free' && vehicles.length >= 1) {
              onOpenUpgradeModal();
            } else {
              onOpenAddVehicleModal(null);
            }
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + Agregar Vehículo
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v) => {
          const isSelected = v.id === activeVehicleId;

          return (
            <div
              key={v.id}
              className={`bg-white rounded-3xl p-6 border shadow-xs transition flex flex-col justify-between gap-4 relative overflow-hidden ${
                isSelected ? 'border-2 border-blue-600 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                    {v.licensePlate || 'SIN PATENTE'}
                  </span>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Seleccionado
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveVehicleId(v.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-blue-600 underline"
                    >
                      Seleccionar
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  {v.brand} {v.model} <span className="text-slate-500 font-normal text-base">{v.version}</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>Año: <strong className="text-slate-800">{v.year}</strong></div>
                  <div>Combustible: <strong className="text-slate-800">{v.fuelType}</strong></div>
                  <div>Motor: <strong className="text-slate-800">{v.engine}</strong></div>
                  <div>Odómetro: <strong className="text-slate-900">{formatKm(v.currentMileage)}</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveVehicleId(v.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Vehículo Principal' : 'Usar este Vehículo'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenAddVehicleModal(v)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {vehicles.length > 1 && (
                    <button
                      onClick={() => setDeleteConfirmId(v.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">¿Seguro que querés eliminar este vehículo?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Se eliminará el vehículo y todo su historial asociado (mantenimientos, gastos y documentos).
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
                  deleteVehicle(deleteConfirmId);
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
