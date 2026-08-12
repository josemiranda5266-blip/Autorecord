import React, { useState } from 'react';
import { INITIAL_TIPS } from '../../data/initialData';
import { TipCategory } from '../../types';
import {
  Lightbulb,
  Search,
  AlertCircle,
  Droplet,
  Disc,
  Zap,
  Thermometer,
  ShieldAlert,
  Gauge,
  Fuel,
  Sparkles,
  MapPin,
  Wind,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES: { id: TipCategory | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'aceite', label: 'Aceite' },
  { id: 'neumáticos', label: 'Neumáticos' },
  { id: 'frenos', label: 'Frenos' },
  { id: 'batería', label: 'Batería' },
  { id: 'refrigeración', label: 'Refrigeración' },
  { id: 'combustible', label: 'Combustible' },
  { id: 'motor', label: 'Motor' },
  { id: 'conducción', label: 'Conducción' },
  { id: 'viajes', label: 'Viajes' },
  { id: 'aire acondicionado', label: 'Aire Acond.' },
  { id: 'limpieza', label: 'Limpieza' },
  { id: 'mantenimiento preventivo', label: 'Preventivo' },
];

export const TipsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TipCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const getIcon = (name: string) => {
    switch (name) {
      case 'Droplet': return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'Disc': return <Disc className="w-5 h-5 text-slate-700" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Thermometer': return <Thermometer className="w-5 h-5 text-red-500" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-orange-500" />;
      case 'Gauge': return <Gauge className="w-5 h-5 text-indigo-500" />;
      case 'Fuel': return <Fuel className="w-5 h-5 text-emerald-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'MapPin': return <MapPin className="w-5 h-5 text-rose-500" />;
      case 'Wind': return <Wind className="w-5 h-5 text-cyan-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredTips = INITIAL_TIPS.filter((tip) => {
    const matchesCat = selectedCategory === 'todos' || tip.category === selectedCategory;
    const matchesQuery =
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          Consejos y Cuidado del Automóvil
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Guías breves y prácticas de mantenimiento preventivo para prolongar la vida útil de tu vehículo
        </p>
      </div>

      {/* MANDATORY SAFETY NOTICE */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-950 text-xs">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Aviso de seguridad:</span>
          Los consejos incluidos en esta sección son educativos y preventivos. En caso de fallas, ruidos extraños o dudas mecánicas, consultá siempre a un técnico o taller profesional.
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palabra clave (aceite, frenos, batería...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tips Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-200 transition space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {getIcon(tip.iconName)}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {tip.category}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{tip.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{tip.content}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{tip.minMileage ? `Para +${tip.minMileage.toLocaleString('es-AR')} km` : 'Aplica a todos los vehículos'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
