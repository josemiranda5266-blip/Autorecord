import React from 'react';
import { useApp, TabType } from '../../context/AppContext';

export type { TabType };
import {
  Home,
  Wrench,
  DollarSign,
  Lightbulb,
  User,
  Car,
  FileText,
  Clock,
  Plus,
  Crown,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab?: TabType;
  setActiveTab?: (tab: TabType) => void;
  onOpenAddModal?: (type: 'maintenance' | 'expense' | 'document' | 'vehicle') => void;
  onOpenUpgradeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onOpenAddModal,
  onOpenUpgradeModal,
}) => {
  const {
    activeVehicle,
    vehicles,
    setActiveVehicleId,
    userPlan,
    isDemoMode,
    activeTab: contextActiveTab,
    setActiveTab: contextSetActiveTab,
  } = useApp();

  const currentTab = propActiveTab || contextActiveTab;
  const handleTabChange = propSetActiveTab || contextSetActiveTab;

  const primaryNavItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'maintenance', label: 'Mantenimiento', icon: Wrench },
    { id: 'expenses', label: 'Gastos', icon: DollarSign },
    { id: 'tips', label: 'Consejos', icon: Lightbulb },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const secondaryNavItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'history', label: 'Historial', icon: Clock },
    { id: 'vehicles', label: 'Mis Vehículos', icon: Car },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800/80 min-h-screen sticky top-0 shrink-0 select-none shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">AutoRecord</h1>
              <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">
                Tu auto, bajo control
              </p>
            </div>
          </div>

          {/* Demo Mode Badge */}
          {isDemoMode && (
            <div className="mt-3 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] font-medium flex items-center gap-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Modo Demo Activo</span>
            </div>
          )}
        </div>

        {/* Vehicle Selector */}
        {vehicles.length > 0 && (
          <div className="p-4 border-b border-slate-800/60">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Vehículo Seleccionado
            </label>
            <select
              value={activeVehicle?.id || ''}
              onChange={(e) => setActiveVehicleId(e.target.value)}
              className="w-full bg-slate-800/90 text-white text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-inner"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.licensePlate || `${v.year}`})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Actions Buttons */}
        {onOpenAddModal && (
          <div className="p-4">
            <button
              onClick={() => onOpenAddModal('maintenance')}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Registrar Mantenimiento
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menú Principal
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (currentTab === 'dashboard' && item.id === 'home');
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold ring-1 ring-blue-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="px-3 pt-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Gestión Completa
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold ring-1 ring-blue-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Plan Upgrade Banner */}
        <div className="p-4 border-t border-slate-800/80">
          {userPlan === 'premium' ? (
            <div className="p-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold">Plan Premium Activo</p>
                <p className="text-[10px] text-amber-400/80">Acceso a todas las funciones</p>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenUpgradeModal}
              className="w-full p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 rounded-xl text-amber-300 transition text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-amber-200">AutoRecord Premium</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Múltiples vehículos, historial ilimitado y documentos
              </p>
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/90 text-slate-400 px-2 py-1.5 shadow-2xl select-none">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (currentTab === 'dashboard' && item.id === 'home');
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl transition-all ${
                  isActive ? 'text-blue-400 font-semibold scale-105' : 'hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition ${
                    isActive ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
