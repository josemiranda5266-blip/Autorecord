import {
  Vehicle,
  MaintenanceItem,
  Expense,
  DocumentRecord,
  OverallVehicleStatus,
  Tip,
  UrgencyLevel,
  UrgencyInfo,
  PreventiveRecommendation,
  MaintenanceType,
} from '../types';
import { getDaysDifference } from './formatters';
import { INITIAL_TIPS, DEFAULT_MAINTENANCE_RULES } from '../data/initialData';

export function getUrgencyInfo(level: UrgencyLevel): UrgencyInfo {
  switch (level) {
    case 5:
      return {
        level: 5,
        label: 'CRÍTICO',
        badgeBg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-500',
        glowColor: 'shadow-red-500/20',
        iconName: 'OctagonAlert',
        actionText: 'Atención prioritaria',
        shortDescription:
          'Atención prioritaria. Se recomienda realizar esta revisión antes de continuar utilizando normalmente el vehículo.',
      };
    case 4:
      return {
        level: 4,
        label: 'URGENTE',
        badgeBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
        textColor: 'text-orange-700 dark:text-orange-400',
        borderColor: 'border-orange-400',
        glowColor: 'shadow-orange-500/20',
        iconName: 'AlertCircle',
        actionText: 'Revisar lo antes posible',
        shortDescription: 'El mantenimiento o documento está vencido.',
      };
    case 3:
      return {
        level: 3,
        label: 'IMPORTANTE',
        badgeBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30',
        textColor: 'text-amber-800 dark:text-amber-400',
        borderColor: 'border-amber-400',
        glowColor: 'shadow-amber-500/20',
        iconName: 'AlertTriangle',
        actionText: 'Revisar próximamente',
        shortDescription: 'El mantenimiento está próximo a vencer.',
      };
    case 2:
      return {
        level: 2,
        label: 'PREVENTIVO',
        badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-400',
        glowColor: 'shadow-blue-500/20',
        iconName: 'Clock',
        actionText: 'Programar revisión',
        shortDescription: 'Conviene planificar la revisión próximamente.',
      };
    case 1:
    default:
      return {
        level: 1,
        label: 'INFORMATIVO',
        badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
        textColor: 'text-slate-600 dark:text-slate-400',
        borderColor: 'border-slate-300 dark:border-slate-700',
        glowColor: 'shadow-slate-500/10',
        iconName: 'Info',
        actionText: 'Revisiones al día',
        shortDescription: 'La revisión todavía no es necesaria.',
      };
  }
}

export const SAFETY_MAINTENANCE_TYPES: MaintenanceType[] = [
  'Frenos',
  'Pastillas',
  'Discos',
  'Líquido de frenos',
  'Correa de distribución',
  'Neumáticos',
  'Dirección',
  'Suspensión',
];

export const MAINTENANCE_THRESHOLDS = {
  PREVENTIVE_KM: 3000,
  PREVENTIVE_DAYS: 60,
  IMPORTANT_KM: 1000,
  IMPORTANT_DAYS: 15,
  CRITICAL_KM_EXCESS: -3000,
  CRITICAL_DAYS_EXCESS: -60,
};

export function isSafetyComponentType(type: MaintenanceType): boolean {
  return SAFETY_MAINTENANCE_TYPES.includes(type);
}

export function calculateMaintenanceUrgency(
  item: MaintenanceItem,
  currentMileage: number
): { level: UrgencyLevel; remainingKm?: number; remainingDays?: number; reason: string } {
  if (item.isCompleted) {
    return {
      level: 1,
      reason: 'Mantenimiento completado correctamente.',
    };
  }

  let remainingKm: number | undefined = undefined;
  if (typeof item.nextMileageDue === 'number' && item.nextMileageDue > 0) {
    remainingKm = item.nextMileageDue - currentMileage;
  }

  let remainingDays: number | undefined = undefined;
  if (item.nextDateDue) {
    remainingDays = getDaysDifference(item.nextDateDue);
  }

  const isSafety =
    item.isSafetyComponent === true || isSafetyComponentType(item.type);

  // Severe overdue on safety or high excess -> CRITICAL (Level 5)
  const isKmCritical =
    remainingKm !== undefined && remainingKm < MAINTENANCE_THRESHOLDS.CRITICAL_KM_EXCESS;
  const isDaysCritical =
    remainingDays !== undefined && remainingDays < MAINTENANCE_THRESHOLDS.CRITICAL_DAYS_EXCESS;
  const isSafetyOverdue =
    isSafety &&
    ((remainingKm !== undefined && remainingKm < 0) ||
      (remainingDays !== undefined && remainingDays < 0));

  if (isKmCritical || isDaysCritical || isSafetyOverdue) {
    let reason = '';
    if (isSafetyOverdue) {
      reason = `Componente de seguridad (${item.type}) vencido. Se requiere atención inmediata.`;
    } else if (isKmCritical) {
      reason = `Excedido por ${Math.abs(remainingKm!).toLocaleString('es-AR')} km del intervalo configurado.`;
    } else {
      reason = `Excedido por ${Math.abs(remainingDays!)} días del intervalo temporal.`;
    }
    return { level: 5, remainingKm, remainingDays, reason };
  }

  // Standard overdue -> URGENTE (Level 4)
  const isKmOverdue = remainingKm !== undefined && remainingKm < 0;
  const isDaysOverdue = remainingDays !== undefined && remainingDays < 0;

  if (isKmOverdue || isDaysOverdue) {
    let reason = 'El mantenimiento está vencido.';
    if (isKmOverdue && remainingKm !== undefined) {
      reason = `Vencido por ${Math.abs(remainingKm).toLocaleString('es-AR')} km.`;
    } else if (isDaysOverdue && remainingDays !== undefined) {
      reason = `Vencido hace ${Math.abs(remainingDays)} días.`;
    }
    return { level: 4, remainingKm, remainingDays, reason };
  }

  // Close to due -> IMPORTANTE (Level 3)
  const isKmImportant =
    remainingKm !== undefined && remainingKm <= MAINTENANCE_THRESHOLDS.IMPORTANT_KM;
  const isDaysImportant =
    remainingDays !== undefined && remainingDays <= MAINTENANCE_THRESHOLDS.IMPORTANT_DAYS;

  if (isKmImportant || isDaysImportant) {
    let reason = 'El mantenimiento está muy próximo a vencer.';
    if (isKmImportant && remainingKm !== undefined) {
      reason = `Faltan solo ${remainingKm.toLocaleString('es-AR')} km para el servicio.`;
    } else if (isDaysImportant && remainingDays !== undefined) {
      reason = `Faltan solo ${remainingDays} días para la fecha programada.`;
    }
    return { level: 3, remainingKm, remainingDays, reason };
  }

  // Upcoming -> PREVENTIVO (Level 2)
  const isKmPreventive =
    remainingKm !== undefined && remainingKm <= MAINTENANCE_THRESHOLDS.PREVENTIVE_KM;
  const isDaysPreventive =
    remainingDays !== undefined && remainingDays <= MAINTENANCE_THRESHOLDS.PREVENTIVE_DAYS;

  if (isKmPreventive || isDaysPreventive) {
    let reason = 'Conviene planificar la revisión próximamente.';
    if (isKmPreventive && remainingKm !== undefined) {
      reason = `Faltan aproximadamente ${remainingKm.toLocaleString('es-AR')} km para el servicio.`;
    } else if (isDaysPreventive && remainingDays !== undefined) {
      reason = `Faltan aproximadamente ${remainingDays} días.`;
    }
    return { level: 2, remainingKm, remainingDays, reason };
  }

  // Informative -> INFORMATIVO (Level 1)
  let reason = 'Revisión en estado óptimo. Sin acción inmediata necesaria.';
  if (remainingKm !== undefined) {
    reason = `Faltan aproximadamente ${remainingKm.toLocaleString('es-AR')} km para la próxima revisión.`;
  }
  return { level: 1, remainingKm, remainingDays, reason };
}

export function calculateDocumentUrgency(
  doc: DocumentRecord
): { level: UrgencyLevel; remainingDays: number; reason: string } {
  const remainingDays = getDaysDifference(doc.expirationDate);

  if (remainingDays < 0) {
    const absDays = Math.abs(remainingDays);
    if (absDays > 30 && (doc.type === 'VTV/RTO' || doc.type === 'Seguro' || doc.type === 'Licencia')) {
      return {
        level: 5,
        remainingDays,
        reason: `Documentación crítica (${doc.title}) vencida hace ${absDays} días. Vehículo no apto para circular legalmente.`,
      };
    }
    return {
      level: 4,
      remainingDays,
      reason: `Documento vencido hace ${absDays} días (${doc.title}).`,
    };
  }

  if (remainingDays <= 15) {
    return {
      level: 3,
      remainingDays,
      reason: remainingDays === 0 ? 'El documento vence HOY.' : `El documento vence en ${remainingDays} días.`,
    };
  }

  if (remainingDays <= 45) {
    return {
      level: 2,
      remainingDays,
      reason: `Vencimiento próximo en ${remainingDays} días.`,
    };
  }

  return {
    level: 1,
    remainingDays,
    reason: `Documentación al día. Vence en ${remainingDays} días.`,
  };
}

export function generatePreventiveRecommendations(
  vehicle: Vehicle,
  maintenances: MaintenanceItem[],
  documents: DocumentRecord[]
): PreventiveRecommendation[] {
  const recommendations: PreventiveRecommendation[] = [];

  const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === vehicle.id);
  const vehicleDocs = documents.filter((d) => d.vehicleId === vehicle.id);

  // 1. Process explicit maintenance items
  for (const item of vehicleMaintenances) {
    if (item.isCompleted) continue;

    const urgencyCalc = calculateMaintenanceUrgency(item, vehicle.currentMileage);
    const urgencyInfo = getUrgencyInfo(urgencyCalc.level);
    const isSafety = item.isSafetyComponent === true || isSafetyComponentType(item.type);

    recommendations.push({
      id: `rec-maint-${item.id}`,
      vehicleId: vehicle.id,
      title: item.type === 'Otro' && item.customType ? item.customType : item.type,
      category: item.type,
      reason: urgencyCalc.reason,
      recommendedKmInterval: item.intervalKm,
      recommendedMonthInterval: item.intervalMonths,
      nextMileageDue: item.nextMileageDue,
      nextDateDue: item.nextDateDue,
      remainingKm: urgencyCalc.remainingKm,
      remainingDays: urgencyCalc.remainingDays,
      urgency: urgencyCalc.level,
      urgencyInfo,
      isSafetyComponent: isSafety,
      status: 'pending',
      createdAt: item.createdAt,
      lastCheckedDate: new Date().toISOString(),
      notes: item.description || item.notes,
      maintenanceItemId: item.id,
    });
  }

  // 2. Process documents
  for (const doc of vehicleDocs) {
    const docUrgency = calculateDocumentUrgency(doc);
    const urgencyInfo = getUrgencyInfo(docUrgency.level);

    recommendations.push({
      id: `rec-doc-${doc.id}`,
      vehicleId: vehicle.id,
      title: `Vencimiento de ${doc.type}: ${doc.title}`,
      category: 'Documento',
      reason: docUrgency.reason,
      nextDateDue: doc.expirationDate,
      remainingDays: docUrgency.remainingDays,
      urgency: docUrgency.level,
      urgencyInfo,
      isSafetyComponent: doc.type === 'VTV/RTO' || doc.type === 'Seguro',
      status: 'pending',
      createdAt: doc.createdAt,
      lastCheckedDate: new Date().toISOString(),
      notes: doc.observations,
      documentId: doc.id,
    });
  }

  // 3. Process missing default preventive maintenance rules
  for (const rule of DEFAULT_MAINTENANCE_RULES) {
    if (rule.type === 'VTV/RTO' || rule.type === 'Seguro') continue;

    // Check if vehicle has an active or recent record for this rule.type
    const existingMaint = vehicleMaintenances.find((m) => m.type === rule.type);
    if (!existingMaint) {
      const isSafety = isSafetyComponentType(rule.type);
      const level: UrgencyLevel = 2; // Preventivo
      const reason = `No encontramos un mantenimiento de ${rule.type.toLowerCase()} registrado. Podés configurarlo o registrar el último realizado.`;

      recommendations.push({
        id: `rec-rule-${rule.type.toLowerCase().replace(/\s+/g, '-')}`,
        vehicleId: vehicle.id,
        title: `Sin registro: ${rule.type}`,
        category: rule.type,
        reason,
        recommendedKmInterval: rule.intervalKm,
        recommendedMonthInterval: rule.intervalMonths,
        urgency: level,
        urgencyInfo: {
          ...getUrgencyInfo(level),
          actionText: 'Registrar mantenimiento',
          shortDescription: `No encontramos un mantenimiento de ${rule.type.toLowerCase()} registrado.`,
        },
        isSafetyComponent: isSafety,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastCheckedDate: new Date().toISOString(),
        notes: rule.description,
      });
    }
  }

  // Sort recommendations from highest urgency (Level 5) to lowest (Level 1)
  recommendations.sort((a, b) => {
    if (b.urgency !== a.urgency) {
      return b.urgency - a.urgency;
    }
    // Secondary sort: most overdue remainingKm or remainingDays first
    const aMin = Math.min(a.remainingKm ?? 999999, (a.remainingDays ?? 9999) * 100);
    const bMin = Math.min(b.remainingKm ?? 999999, (b.remainingDays ?? 9999) * 100);
    return aMin - bMin;
  });

  return recommendations;
}

export interface VehicleCalculatedState {
  status: OverallVehicleStatus;
  statusTitle: string;
  statusSubtitle: string;
  indicatorBadgeClass: string;
  recommendations: PreventiveRecommendation[];
  priorities: PreventiveRecommendation[]; // Sorted by urgency 5 -> 1
  criticalCount: number;
  urgentCount: number;
  importantCount: number;
  preventiveCount: number;
  informativeCount: number;
  overdueCount: number;
  upcomingCount: number;
  completedCount: number;
  monthlyExpenses: number;
  annualExpenses: number;
  totalExpenses: number;
  costPerKm: number | null;
  personalizedTip: Tip;
  nextMaintenance: { type: string; detail: string; status: 'overdue' | 'upcoming' | 'ok' } | null;
  nextDocument: { title: string; detail: string; status: 'overdue' | 'upcoming' | 'ok' } | null;
}

export function calculateVehicleOverview(
  vehicle: Vehicle,
  maintenances: MaintenanceItem[],
  expenses: Expense[],
  documents: DocumentRecord[]
): VehicleCalculatedState {
  const recommendations = generatePreventiveRecommendations(vehicle, maintenances, documents);

  let criticalCount = 0;
  let urgentCount = 0;
  let importantCount = 0;
  let preventiveCount = 0;
  let informativeCount = 0;

  for (const rec of recommendations) {
    if (rec.urgency === 5) criticalCount++;
    else if (rec.urgency === 4) urgentCount++;
    else if (rec.urgency === 3) importantCount++;
    else if (rec.urgency === 2) preventiveCount++;
    else if (rec.urgency === 1) informativeCount++;
  }

  const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === vehicle.id);
  const overdueCount = vehicleMaintenances.filter((m) => {
    if (m.isCompleted) return false;
    const urgency = calculateMaintenanceUrgency(m, vehicle.currentMileage);
    return urgency.level >= 4;
  }).length;

  const upcomingCount = vehicleMaintenances.filter((m) => {
    if (m.isCompleted) return false;
    const urgency = calculateMaintenanceUrgency(m, vehicle.currentMileage);
    return urgency.level === 2 || urgency.level === 3;
  }).length;

  const completedCount = vehicleMaintenances.filter((m) => m.isCompleted).length;

  // Determine overall status badge
  let status: OverallVehicleStatus = 'ok';
  let statusTitle = '🟢 Mantenimiento al día';
  let statusSubtitle = 'Tu vehículo no presenta servicios ni vencimientos urgentes pendientes.';
  let indicatorBadgeClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';

  if (criticalCount > 0 || urgentCount > 0) {
    status = 'overdue';
    statusTitle = criticalCount > 0 ? '🔴 Mantenimiento atrasado / Crítico' : '🟠 Requiere atención urgente';
    statusSubtitle = `Tenés ${criticalCount + urgentCount} tarea(s) que requieren revisión inmediata para mantener la seguridad y fiabilidad del vehículo.`;
    indicatorBadgeClass = criticalCount > 0
      ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/40 animate-pulse'
      : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30';
  } else if (importantCount > 0 || upcomingCount > 0) {
    status = 'upcoming';
    statusTitle = '🟡 Mantenimiento con tareas próximas';
    statusSubtitle = `Se aproximan ${importantCount + upcomingCount} revisión(es) programada(s). Planificalas con tiempo.`;
    indicatorBadgeClass = 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30';
  }

  // Expenses calculations
  const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyExpenses = 0;
  let annualExpenses = 0;
  let totalExpenses = 0;

  for (const exp of vehicleExpenses) {
    totalExpenses += exp.amount || 0;
    const expDate = new Date(exp.date);
    if (!isNaN(expDate.getTime())) {
      if (expDate.getFullYear() === currentYear) {
        annualExpenses += exp.amount || 0;
        if (expDate.getMonth() === currentMonth) {
          monthlyExpenses += exp.amount || 0;
        }
      }
    }
  }

  for (const m of vehicleMaintenances) {
    if (m.cost && m.cost > 0) {
      totalExpenses += m.cost;
      const mDate = new Date(m.date);
      if (!isNaN(mDate.getTime()) && mDate.getFullYear() === currentYear) {
        annualExpenses += m.cost;
        if (mDate.getMonth() === currentMonth) {
          monthlyExpenses += m.cost;
        }
      }
    }
  }

  // Cost per km calculation
  let costPerKm: number | null = null;
  const mileageValues = vehicleExpenses
    .map((e) => e.mileage)
    .filter((m): m is number => typeof m === 'number' && m > 0);

  if (mileageValues.length >= 2) {
    const minM = Math.min(...mileageValues);
    const maxM = Math.max(...mileageValues, vehicle.currentMileage);
    const distanceTraveled = maxM - minM;
    if (distanceTraveled > 100 && annualExpenses > 0) {
      costPerKm = Math.round(annualExpenses / distanceTraveled);
    }
  }

  // Select Personalized Tip
  let personalizedTip = INITIAL_TIPS[0];
  if (criticalCount > 0) {
    const safetyTip = INITIAL_TIPS.find((t) => t.category === 'frenos' || t.category === 'mantenimiento preventivo');
    if (safetyTip) personalizedTip = safetyTip;
  } else if (vehicle.currentMileage >= 150000) {
    const highKmTip = INITIAL_TIPS.find((t) => t.category === 'motor' || t.category === 'refrigeración');
    if (highKmTip) personalizedTip = highKmTip;
  } else {
    const matchingTip = INITIAL_TIPS.find((t) => (t.minMileage || 0) <= vehicle.currentMileage);
    if (matchingTip) personalizedTip = matchingTip;
  }

  // Calculate nextMaintenance card summary
  let nextMaintenance: { type: string; detail: string; status: 'overdue' | 'upcoming' | 'ok' } | null = null;
  const topMaintRec = recommendations.find((r) => r.category !== 'Documento');
  if (topMaintRec) {
    let status: 'overdue' | 'upcoming' | 'ok' = 'ok';
    if (topMaintRec.urgency >= 4) status = 'overdue';
    else if (topMaintRec.urgency >= 2) status = 'upcoming';

    let detail = topMaintRec.reason;
    if (topMaintRec.remainingKm !== undefined) {
      detail = topMaintRec.remainingKm < 0
        ? `Vencido por ${Math.abs(topMaintRec.remainingKm).toLocaleString('es-AR')} km`
        : `En ${topMaintRec.remainingKm.toLocaleString('es-AR')} km`;
    } else if (topMaintRec.remainingDays !== undefined) {
      detail = topMaintRec.remainingDays < 0
        ? `Vencido hace ${Math.abs(topMaintRec.remainingDays)} días`
        : `En ${topMaintRec.remainingDays} días`;
    }

    nextMaintenance = {
      type: topMaintRec.title,
      detail,
      status,
    };
  }

  // Calculate nextDocument card summary
  let nextDocument: { title: string; detail: string; status: 'overdue' | 'upcoming' | 'ok' } | null = null;
  const docRecs = recommendations.filter((r) => r.category === 'Documento');
  if (docRecs.length > 0) {
    const topDoc = docRecs[0];
    let status: 'overdue' | 'upcoming' | 'ok' = 'ok';
    if (topDoc.urgency >= 4) status = 'overdue';
    else if (topDoc.urgency >= 2) status = 'upcoming';

    let detail = topDoc.reason;
    if (topDoc.remainingDays !== undefined) {
      detail = topDoc.remainingDays < 0
        ? `Vencido hace ${Math.abs(topDoc.remainingDays)} días`
        : topDoc.remainingDays === 0
        ? 'Vence HOY'
        : `Vence en ${topDoc.remainingDays} días`;
    }

    nextDocument = {
      title: topDoc.title,
      detail,
      status,
    };
  }

  return {
    status,
    statusTitle,
    statusSubtitle,
    indicatorBadgeClass,
    recommendations,
    priorities: recommendations,
    criticalCount,
    urgentCount,
    importantCount,
    preventiveCount,
    informativeCount,
    overdueCount,
    upcomingCount,
    completedCount,
    monthlyExpenses,
    annualExpenses,
    totalExpenses,
    costPerKm,
    personalizedTip,
    nextMaintenance,
    nextDocument,
  };
}
