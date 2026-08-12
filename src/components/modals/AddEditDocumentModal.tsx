import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord, DocumentType } from '../../types';
import { FileText, X, CheckCircle2 } from 'lucide-react';

const DOCUMENT_TYPES: DocumentType[] = [
  'VTV/RTO',
  'Seguro',
  'Patente',
  'Licencia',
  'Otro',
];

interface AddEditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DocumentRecord | null;
}

export const AddEditDocumentModal: React.FC<AddEditDocumentModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { activeVehicle, addDocument, updateDocument } = useApp();

  const [type, setType] = useState<DocumentType>(initialData?.type || 'VTV/RTO');
  const [title, setTitle] = useState<string>(
    initialData?.title || 'Verificación Técnica Vehicular'
  );
  const [expirationDate, setExpirationDate] = useState<string>(
    initialData?.expirationDate || ''
  );
  const [observations, setObservations] = useState<string>(
    initialData?.observations || ''
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeVehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!type || !title || !expirationDate) {
      setError('Por favor completá el título y la fecha de vencimiento.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateDocument(initialData.id, {
          type,
          title,
          expirationDate,
          observations,
        });
      } else {
        await addDocument({
          vehicleId: activeVehicle.id,
          type,
          title,
          expirationDate,
          observations,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el documento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl transition-all">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">
                {initialData ? 'Editar Documento' : 'Registrar Documentación'}
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
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => {
                const selected = e.target.value as DocumentType;
                setType(selected);
                if (!initialData) {
                  if (selected === 'VTV/RTO') setTitle('Verificación Técnica Vehicular');
                  else if (selected === 'Seguro') setTitle('Póliza de Seguro');
                  else if (selected === 'Patente') setTitle('Comprobante de Patente');
                  else if (selected === 'Licencia') setTitle('Licencia de Conducir');
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            >
              {DOCUMENT_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Título o Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: VTV San Martín / Seguro La Segunda"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fecha de Vencimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observaciones / Número de póliza
            </label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Oblea #98421, grúa incluida hasta 300km..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
            />
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
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-indigo-500/20 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
