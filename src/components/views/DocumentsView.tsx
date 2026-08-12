import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord } from '../../types';
import { formatDateLong, getDaysDifference } from '../../utils/formatters';
import { FileText, Plus, AlertCircle, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface DocumentsViewProps {
  onOpenAddModal: (data?: DocumentRecord | null) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onOpenAddModal }) => {
  const { activeVehicle, documents, deleteDocument } = useApp();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!activeVehicle) return null;

  const vehicleDocs = documents.filter((d) => d.vehicleId === activeVehicle.id);

  // Sort by expiration date ascending
  vehicleDocs.sort(
    (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
  );

  const getDocStatusBadge = (expDate: string) => {
    const days = getDaysDifference(expDate);

    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
          🔴 Vencida hace {Math.abs(days)} días
        </span>
      );
    } else if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
          🟡 Vence en {days === 0 ? 'HOY' : `${days} días`}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
          🟢 En regla (Faltan {days} días)
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Documentación
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de vencimientos de VTV/RTO, seguro, licencias y patentes de {activeVehicle.brand} {activeVehicle.model}
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal(null)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + Registrar Documento
        </button>
      </div>

      {/* Documents Grid */}
      {vehicleDocs.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">Todavía no registraste documentos</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Anotá la fecha de vencimiento de tu VTV, póliza de seguro o registro de conducir para recibir alertas tempranas.
          </p>
          <button
            onClick={() => onOpenAddModal(null)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition"
          >
            + Registrar Documento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicleDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {doc.type}
                  </span>
                  {getDocStatusBadge(doc.expirationDate)}
                </div>

                <h3 className="font-bold text-slate-900 text-base">{doc.title}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Vence: <strong className="text-slate-800">{formatDateLong(doc.expirationDate)}</strong>
                </p>

                {doc.observations && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {doc.observations}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onOpenAddModal(doc)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">¿Seguro que querés eliminar este documento?</h3>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteDocument(deleteConfirmId);
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
