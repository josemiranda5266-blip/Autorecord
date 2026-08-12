import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Crown, Check, X, Sparkles, ShieldCheck } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { userPlan, upgradeToPremium } = useApp();
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpgrade = () => {
    upgradeToPremium();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative transition-all my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/20 mx-auto mb-4">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">AutoRecord Premium</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            El control total y sin límites de toda tu flota personal de vehículos
          </p>
        </div>

        {/* Pricing options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center cursor-pointer hover:border-amber-500 transition">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plan Mensual</div>
            <div className="text-xl font-black text-slate-900 mt-1">$4.990 ARS</div>
            <div className="text-[10px] text-slate-500">Facturado por mes</div>
          </div>

          <div className="p-4 bg-amber-500/10 border-2 border-amber-500 rounded-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
              Ahorrás 33%
            </div>
            <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Plan Anual</div>
            <div className="text-xl font-black text-slate-900 mt-1">$39.900 ARS</div>
            <div className="text-[10px] text-amber-900 font-medium">$3.325 ARS / mes</div>
          </div>
        </div>

        {/* Comparison List */}
        <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Ventajas incluidas en Premium:
          </h4>

          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
              <span><strong>Múltiples vehículos</strong> (Gestión ilimitada de autos)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
              <span><strong>Historial sin límites</strong> y exportación completa a JSON</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
              <span><strong>Estadísticas avanzadas</strong> de gastos y costo por kilómetro</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
              <span><strong>Gestor de Documentación</strong> (VTV, Seguro, Licencias, Patente)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
              <span><strong>Copia de seguridad en la nube</strong> y notificaciones avanzadas</span>
            </li>
          </ul>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center font-bold text-sm flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ¡Felicitaciones! Ya tenés AutoRecord Premium activo
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleSimulateUpgrade}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {userPlan === 'premium' ? 'Ya sos Premium (Reactivar)' : 'Activar AutoRecord Premium'}
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Modo de demostración: podés simular la suscripción sin realizar cobros reales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
