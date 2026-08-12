import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatKm, formatDateShort } from '../../utils/formatters';
import { Clock, Filter, Wrench, DollarSign, Gauge, FileText } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { activeVehicle, maintenances, expenses, mileageLogs, documents } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'maintenance' | 'expense' | 'mileage' | 'document'>('all');

  if (!activeVehicle) return null;

  // Build unified chronological event stream
  interface HistoryEvent {
    id: string;
    date: string;
    type: 'maintenance' | 'expense' | 'mileage' | 'document';
    title: string;
    subtitle?: string;
    cost?: number;
    mileage?: number;
    badge: string;
    badgeColor: string;
  }

  const events: HistoryEvent[] = [];

  // Maintenances
  maintenances
    .filter((m) => m.vehicleId === activeVehicle.id)
    .forEach((m) => {
      events.push({
        id: m.id,
        date: m.date,
        type: 'maintenance',
        title: m.type,
        subtitle: m.description || m.workshop || 'Mantenimiento registrado',
        cost: m.cost,
        mileage: m.mileage,
        badge: m.isCompleted ? 'Mantenimiento Realizado' : 'Mantenimiento Pendiente',
        badgeColor: m.isCompleted ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800',
      });
    });

  // Expenses
  expenses
    .filter((e) => e.vehicleId === activeVehicle.id)
    .forEach((e) => {
      events.push({
        id: e.id,
        date: e.date,
        type: 'expense',
        title: `Gasto: ${e.category}`,
        subtitle: e.description,
        cost: e.amount,
        mileage: e.mileage,
        badge: e.category,
        badgeColor: 'bg-blue-50 text-blue-800',
      });
    });

  // Mileage Logs
  mileageLogs
    .filter((ml) => ml.vehicleId === activeVehicle.id)
    .forEach((ml) => {
      events.push({
        id: ml.id,
        date: ml.date,
        type: 'mileage',
        title: `Lectura Odómetro: ${formatKm(ml.mileage)}`,
        subtitle: ml.notes || 'Actualización de kilometraje',
        mileage: ml.mileage,
        badge: 'Kilometraje',
        badgeColor: 'bg-purple-50 text-purple-800',
      });
    });

  // Documents
  documents
    .filter((d) => d.vehicleId === activeVehicle.id)
    .forEach((d) => {
      events.push({
        id: d.id,
        date: d.createdAt ? d.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        type: 'document',
        title: `Documento: ${d.title}`,
        subtitle: `Vence el ${formatDateShort(d.expirationDate)} • ${d.observations || ''}`,
        badge: d.type,
        badgeColor: 'bg-indigo-50 text-indigo-800',
      });
    });

  // Sort events descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = events.filter((ev) => filterType === 'all' || ev.type === filterType);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'expense': return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'mileage': return <Gauge className="w-4 h-4 text-purple-600" />;
      case 'document': return <FileText className="w-4 h-4 text-indigo-600" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-slate-800" />
          Historial del Vehículo
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Línea de tiempo cronológica de intervenciones, gastos y lecturas de {activeVehicle.brand} {activeVehicle.model}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Todos ({events.length})
        </button>
        <button
          onClick={() => setFilterType('maintenance')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'maintenance' ? 'bg-amber-600 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Mantenimientos
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'expense' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Gastos
        </button>
        <button
          onClick={() => setFilterType('mileage')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'mileage' ? 'bg-purple-600 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Kilometraje
        </button>
        <button
          onClick={() => setFilterType('document')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'document' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Documentos
        </button>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        {filteredEvents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No existen registros para esta categoría.</p>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="relative pl-6">
                {/* Timeline Node */}
                <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-xs">
                  {getEventIcon(ev.type)}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {formatDateShort(ev.date)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{ev.subtitle}</p>

                  <div className="flex items-center justify-between pt-2 text-xs font-medium">
                    {ev.mileage ? (
                      <span className="text-slate-500">{formatKm(ev.mileage)}</span>
                    ) : (
                      <span></span>
                    )}

                    {ev.cost && ev.cost > 0 ? (
                      <span className="font-bold text-slate-900">{formatCurrency(ev.cost)}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
