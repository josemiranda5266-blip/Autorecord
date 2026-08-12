import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Crown,
  Download,
  RefreshCw,
  LogOut,
  Shield,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAuthModal: () => void;
  onOpenUpgradeModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenAuthModal,
  onOpenUpgradeModal,
}) => {
  const {
    user,
    logout,
    userPlan,
    exportDataJson,
    loadDemoData,
    clearAllData,
    isDemoMode,
  } = useApp();

  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autorecord-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-slate-800" />
          Mi Cuenta y Configuración
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Gestión de cuenta, suscripción y copias de seguridad de datos
        </p>
      </div>

      {/* Account Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-lg">
              {user?.email ? user.email[0].toUpperCase() : 'G'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {user ? user.displayName || user.email : 'Usuario Invitado / Demo'}
              </h3>
              <p className="text-xs text-slate-400">
                {user ? user.email : 'Sesión local almacenada en el dispositivo'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {userPlan === 'premium' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
                <Crown className="w-4 h-4 text-amber-600" />
                Plan Premium
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full">
                Plan Gratuito
              </span>
            )}
          </div>
        </div>

        {user ? (
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={logout}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Iniciá sesión para sincronizar tus datos en la nube.</p>
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20"
            >
              Iniciar Sesión / Registrarse
            </button>
          </div>
        )}
      </div>

      {/* Plan Upgrade Card */}
      {userPlan === 'free' && (
        <div className="bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-950 text-amber-300 font-black text-[10px] rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Obtené el control total
            </div>
            <h3 className="text-xl font-black text-slate-950">Pasate a AutoRecord Premium</h3>
            <p className="text-xs font-medium text-slate-900 opacity-90 max-w-md">
              Gestioná múltiples vehículos, exportá historiales ilimitados y calculá estadísticas avanzadas.
            </p>
          </div>

          <button
            onClick={onOpenUpgradeModal}
            className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition shadow-xl shrink-0"
          >
            Ver Planes y Precios
          </button>
        </div>
      )}

      {/* Backup & Data Export Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          Copia de Seguridad y Datos
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Exportar Historial Completo (JSON)</h4>
              <p className="text-[11px] text-slate-500">
                Descargá un archivo con todos tus vehículos, mantenimientos, gastos y documentos.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              {copied ? '¡Descargado!' : 'Descargar JSON'}
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Cargar Datos de Demostración</h4>
              <p className="text-[11px] text-slate-500">
                Restablece los datos de prueba (Renault Kangoo 2011 con mantenimientos y gastos reales).
              </p>
            </div>
            <button
              onClick={loadDemoData}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Reiniciar Demo
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl p-6 border border-red-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-red-600 text-xs uppercase tracking-wider">
          Zona de Riesgo
        </h3>
        <p className="text-xs text-slate-500">
          Eliminar todos los datos locales almacenados en el navegador. Esta acción no se puede deshacer.
        </p>

        <button
          onClick={() => {
            if (confirm('¿Seguro que querés borrar todos los datos locales?')) {
              clearAllData();
            }
          }}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Borrar todo el historial local
        </button>
      </div>
    </div>
  );
};
