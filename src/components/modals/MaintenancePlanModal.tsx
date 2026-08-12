import React from 'react';
import { DEFAULT_MAINTENANCE_RULES } from '../../data/initialData';
import { BookOpen, X, AlertCircle } from 'lucide-react';

interface MaintenancePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaintenancePlanModal: React.FC<MaintenancePlanModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 transition-all">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-900">Plan de Mantenimiento Sugerido</h3>
              <p className="text-xs text-slate-500 font-medium">
                Tabla de intervalos de referencia general
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

        {/* MANDATORY DISCLAIMER BOX */}
        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl mb-6 flex items-start gap-3 text-amber-900 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950 mb-0.5">
              Nota importante sobre los intervalos:
            </span>
            Los valores indicados a continuación se presentan exclusivamente como{' '}
            <strong className="underline">"Referencia general"</strong>. Se recomienda siempre consultar el{' '}
            <strong>manual del fabricante</strong> de tu vehículo para verificar los fluidos, repuestos e intervalos específicos.
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {DEFAULT_MAINTENANCE_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="font-bold text-sm text-slate-900">{rule.type}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
              </div>
              <div className="text-left sm:text-right shrink-0 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                <div className="text-xs font-bold text-blue-700">
                  {rule.intervalKm > 0 ? `Cada ${rule.intervalKm.toLocaleString('es-AR')} km` : ''}
                  {rule.intervalKm > 0 && rule.intervalMonths > 0 ? ' o ' : ''}
                  {rule.intervalMonths > 0 ? `${rule.intervalMonths} meses` : ''}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Lo que ocurra primero</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
