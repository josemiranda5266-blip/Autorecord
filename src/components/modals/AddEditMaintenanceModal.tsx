import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceItem, MaintenanceType } from '../../types';
import { Wrench, X, CheckCircle2 } from 'lucide-react';

const MAINTENANCE_TYPES: MaintenanceType[] = [
  'Cambio de aceite',
  'Filtro de aceite',
  'Filtro de aire',
  'Filtro de combustible',
  'Filtro de habitáculo',
  'Bujías',
  'Batería',
  'Frenos',
  'Pastillas',
  'Discos',
  'Neumáticos',
  'Alineación',
  'Balanceo',
  'Refrigerante',
  'Líquido de frenos',
  'Correa de distribución',
  'Correa auxiliar',
  'Suspensión',
  'Amortiguadores',
  'Aire acondicionado',
  'Service general',
  'VTV/RTO',
  'Seguro',
  'Otro',
];

interface AddEditMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MaintenanceItem | null;
}

export const AddEditMaintenanceModal: React.FC<AddEditMaintenanceModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { activeVehicle, addMaintenance, updateMaintenance } = useApp();

  const [type, setType] = useState<MaintenanceType>(
    initialData?.type || 'Cambio de aceite'
  );
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [mileage, setMileage] = useState<string>(
    initialData?.mileage ? String(initialData.mileage) : activeVehicle ? String(activeVehicle.currentMileage) : ''
  );
  const [cost, setCost] = useState<string>(
    initialData?.cost ? String(initialData.cost) : ''
  );
  const [workshop, setWorkshop] = useState<string>(initialData?.workshop || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [nextMileageDue, setNextMileageDue] = useState<string>(
    initialData?.nextMileageDue ? String(initialData.nextMileageDue) : ''
  );
  const [nextDateDue, setNextDateDue] = useState<string>(initialData?.nextDateDue || '');
  const [isCompleted, setIsCompleted] = useState<boolean>(
    initialData ? initialData.isCompleted : true
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeVehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const mileageNum = parseInt(mileage.replace(/\D/g, ''), 10);
    const costNum = parseFloat(cost.replace(/[^0-9.]/g, '')) || 0;
    const nextKmNum = nextMileageDue ? parseInt(nextMileageDue.replace(/\D/g, ''), 10) : undefined;

    if (!type || !date || isNaN(mileageNum)) {
      setError('Por favor completá los campos obligatorios (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateMaintenance(initialData.id, {
          type,
          date,
          mileage: mileageNum,
          cost: costNum,
          workshop,
          description,
          notes,
          nextMileageDue: nextKmNum,
          nextDateDue: nextDateDue || undefined,
          isCompleted,
        });
      } else {
        await addMaintenance({
          vehicleId: activeVehicle.id,
          type,
          date,
          mileage: mileageNum,
          cost: costNum,
          workshop,
          description,
          notes,
          nextMileageDue: nextKmNum,
          nextDateDue: nextDateDue || undefined,
          isCompleted,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el mantenimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8 transition-all">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">
                {initialData ? 'Editar Mantenimiento' : 'Registrar Mantenimiento'}
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
              Tipo de Mantenimiento <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceType)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            >
              {MAINTENANCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kilometraje <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder={`Ej: ${activeVehicle.currentMileage}`}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Costo ($ ARS)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Ej: 65000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Taller / Proveedor
              </label>
              <input
                type="text"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                placeholder="Ej: Taller San José"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descripción / Detalles
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Aceite 10W40 Semisintético + Filtro de aceite"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Próximo Mantenimiento Programado */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Próximo vencimiento / aviso</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Próximo kilometraje (km)
                </label>
                <input
                  type="number"
                  value={nextMileageDue}
                  onChange={(e) => setNextMileageDue(e.target.value)}
                  placeholder={`Ej: ${parseInt(mileage || '0', 10) + 10000}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Próxima fecha
                </label>
                <input
                  type="date"
                  value={nextDateDue}
                  onChange={(e) => setNextDateDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCompleted"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isCompleted" className="text-xs font-medium text-slate-700 cursor-pointer">
              Mantenimiento ya realizado (desmarcar si es una tarea pendiente)
            </label>
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
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
