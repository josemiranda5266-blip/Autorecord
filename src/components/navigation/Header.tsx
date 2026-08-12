import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  Plus,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  Gauge,
  Crown,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: (type: 'maintenance' | 'expense' | 'document' | 'vehicle') => void;
  onOpenMileageModal: () => void;
  onOpenAuthModal: () => void;
  onOpenUpgradeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenMileageModal,
  onOpenAuthModal,
  onOpenUpgradeModal,
}) => {
  const {
    vehicles,
    activeVehicle,
    setActiveVehicleId,
    user,
    logout,
    isDemoMode,
    loadDemoData,
    userPlan,
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Demo Banner */}
      {isDemoMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
            <span className="truncate">
              Modo Demo Activo (Renault Kangoo 1.6 16V 240.000 km)
            </span>
          </div>
          <button
            onClick={loadDemoData}
            className="shrink-0 bg-slate-900 text-amber-300 hover:bg-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reiniciar Demo
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Mobile Brand / Vehicle Switcher */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Car className="w-5 h-5" />
          </div>

          {/* Vehicle Dropdown Selector */}
          <div className="relative">
            {activeVehicle ? (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {activeVehicle.brand} {activeVehicle.model}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                      {activeVehicle.licensePlate || activeVehicle.year}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeVehicle.engine} • {activeVehicle.currentMileage.toLocaleString('es-AR')} km
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAddModal('vehicle')}
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition"
              >
                <Plus className="w-4 h-4" />
                Agregar Vehículo
              </button>
            )}

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1">
                  Seleccionar Vehículo
                </div>
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveVehicleId(v.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition ${
                      v.id === activeVehicle?.id ? 'bg-blue-50/60 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div>
                        {v.brand} {v.model}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {v.currentMileage.toLocaleString('es-AR')} km
                      </div>
                    </div>
                    {v.id === activeVehicle?.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-100 mt-1 px-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenAddModal('vehicle');
                    }}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar otro vehículo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Mileage Update button */}
          <button
            onClick={onOpenMileageModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition"
          >
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>Actualizar km</span>
          </button>

          {/* Quick Add Menu */}
          <div className="relative">
            <button
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>

            {isQuickAddOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                <button
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    onOpenAddModal('maintenance');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="p-1 bg-amber-50 text-amber-600 rounded">🔧</span>
                  Mantenimiento
                </button>
                <button
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    onOpenAddModal('expense');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="p-1 bg-emerald-50 text-emerald-600 rounded">💰</span>
                  Gasto
                </button>
                <button
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    onOpenMileageModal();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="p-1 bg-blue-50 text-blue-600 rounded">📊</span>
                  Kilometraje
                </button>
                <button
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    onOpenAddModal('document');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="p-1 bg-indigo-50 text-indigo-600 rounded">📄</span>
                  Documento
                </button>
              </div>
            )}
          </div>

          {/* User Account / Auth button */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-xs font-medium flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
