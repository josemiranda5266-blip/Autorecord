import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatKm, formatDateShort, formatDateLong } from '../../utils/formatters';
import { Clock, Filter, Wrench, DollarSign, Gauge, FileText, Printer, FileCheck, Car, Share2, Check } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { activeVehicle, maintenances, expenses, mileageLogs, documents } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'maintenance' | 'expense' | 'mileage' | 'document'>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

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
    workshop?: string;
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
        title: m.type === 'Otro' && m.customType ? m.customType : m.type,
        subtitle: m.description || m.workshop || 'Mantenimiento registrado',
        cost: m.cost,
        mileage: m.mileage,
        workshop: m.workshop,
        badge: m.isCompleted ? 'Realizado' : 'Pendiente',
        badgeColor: m.isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200',
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
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
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
        badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
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
        badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
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

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const textSummary = `AUTORECORD - HISTORIAL DE MANTENIMIENTO DEL VEHÍCULO
Vehículo: ${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.version} (${activeVehicle.year})
Patente: ${activeVehicle.licensePlate || 'N/A'} | Odómetro Actual: ${formatKm(activeVehicle.currentMileage)}
VIN / Chasis: ${activeVehicle.vin || 'N/A'}

RESUMEN DE MANTENIMIENTOS REALIZADOS:
${maintenances
  .filter((m) => m.vehicleId === activeVehicle.id && m.isCompleted)
  .map((m) => `- ${formatDateShort(m.date)} (${formatKm(m.mileage)}): ${m.type} ${m.workshop ? `@ ${m.workshop}` : ''} (${formatCurrency(m.cost)})`)
  .join('\n')}

Generado con AutoRecord - Asistente de Mantenimiento Preventivo`;

    navigator.clipboard.writeText(textSummary);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-slate-800" />
            Historial del Vehículo
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Línea de tiempo cronológica de intervenciones, servicios y lecturas de {activeVehicle.brand} {activeVehicle.model}
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Generar Reporte para Venta / Taller</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todos ({events.length})
        </button>
        <button
          onClick={() => setFilterType('maintenance')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'maintenance' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Mantenimientos
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'expense' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Gastos
        </button>
        <button
          onClick={() => setFilterType('mileage')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'mileage' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Kilometraje
        </button>
        <button
          onClick={() => setFilterType('document')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'document' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
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
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {formatDateShort(ev.date)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{ev.subtitle}</p>

                  <div className="flex items-center justify-between pt-2 text-xs font-medium border-t border-slate-200/60 mt-2">
                    {ev.mileage ? (
                      <span className="text-slate-500 font-mono">Odómetro: <strong>{formatKm(ev.mileage)}</strong></span>
                    ) : (
                      <span></span>
                    )}

                    {ev.cost && ev.cost > 0 ? (
                      <span className="font-bold text-slate-900">Costo: {formatCurrency(ev.cost)}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export / Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto print:max-w-none print:shadow-none print:p-0">
            {/* Header / Vehicle Dossier */}
            <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-blue-600 font-black text-xs uppercase tracking-wider mb-1">
                  <Car className="w-4 h-4" />
                  <span>AUTORECORD — REPORTE TÉCNICO DE MANTENIMIENTO</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {activeVehicle.brand} {activeVehicle.model} {activeVehicle.version}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Año: {activeVehicle.year} • Patente: {activeVehicle.licensePlate || 'N/A'} • Odómetro: {formatKm(activeVehicle.currentMileage)}
                  {activeVehicle.vin && ` • VIN: ${activeVehicle.vin}`}
                </p>
              </div>

              <div className="text-right print:hidden">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content summary for print/export */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Historial de Servicios y Mantenimientos Realizados
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Km</th>
                      <th className="p-3">Intervención / Servicio</th>
                      <th className="p-3">Taller</th>
                      <th className="p-3 text-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenances
                      .filter((m) => m.vehicleId === activeVehicle.id && m.isCompleted)
                      .map((m) => (
                        <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-mono">{formatDateShort(m.date)}</td>
                          <td className="p-3 font-mono">{formatKm(m.mileage)}</td>
                          <td className="p-3 font-bold text-slate-900">{m.type} {m.description ? `- ${m.description}` : ''}</td>
                          <td className="p-3 text-slate-600">{m.workshop || 'Particular'}</td>
                          <td className="p-3 text-right font-bold">{m.cost ? formatCurrency(m.cost) : '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions for modal */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Imprimir o Guardar PDF
              </button>

              <button
                onClick={handleCopySummary}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
                {copiedSuccess ? '¡Copiado al portapapeles!' : 'Copiar Resumen en Texto'}
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full sm:w-auto sm:ml-auto px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
