import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKm } from '../../utils/formatters';
import { AlertTriangle, Gauge, CheckCircle2, X } from 'lucide-react';

interface UpdateMileageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateMileageModal: React.FC<UpdateMileageModalProps> = ({ isOpen, onClose }) => {
  const { activeVehicle, updateMileage } = useApp();
  const [newMileageStr, setNewMileageStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [warningLower, setWarningLower] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !activeVehicle) return null;

  const currentKm = activeVehicle.currentMileage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseInt(newMileageStr.replace(/\D/g, ''), 10);
    if (isNaN(val) || val <= 0) {
      setError('Por favor ingresá un kilometraje válido mayor a 0.');
      return;
    }

    if (val < currentKm && !warningLower) {
      setWarningLower(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMileage(activeVehicle.id, val, notes);
      setNewMileageStr('');
      setNotes('');
      setWarningLower(false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el kilometraje');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transition-all">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Actualizar Kilometraje</h3>
              <p className="text-xs text-slate-500">
                {activeVehicle.brand} {activeVehicle.model} ({activeVehicle.licensePlate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Kilometraje actual
            </div>
            <div className="text-xl font-bold text-slate-800">{formatKm(currentKm)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nuevo kilometraje <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={newMileageStr}
              onChange={(e) => {
                setNewMileageStr(e.target.value);
                setWarningLower(false);
                setError(null);
              }}
              placeholder={`Ej: ${currentKm + 500}`}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas u observaciones (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Control mensual, viaje en ruta..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
            />
          </div>

          {warningLower && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Atención: Kilometraje menor</p>
                <p className="mt-1">
                  El nuevo kilometraje ({formatKm(parseInt(newMileageStr, 10))}) es menor al registrado actualmente ({formatKm(currentKm)}).
                </p>
                <p className="mt-1 font-medium text-amber-900">
                  ¿Confirmás que querés guardar este valor?
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {warningLower ? 'Confirmar actualización' : 'Guardar kilometraje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
