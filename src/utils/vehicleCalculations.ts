import {
  Vehicle,
  MaintenanceItem,
  Expense,
  DocumentRecord,
  OverallVehicleStatus,
  Tip,
} from '../types';
import { getDaysDifference } from './formatters';
import { INITIAL_TIPS } from '../data/initialData';

export interface VehicleCalculatedState {
  status: OverallVehicleStatus;
  statusTitle: string;
  statusSubtitle: string;
  nextMaintenance: {
    type: string;
    detail: string;
    status: 'ok' | 'upcoming' | 'overdue';
  } | null;
  nextDocument: {
    title: string;
    detail: string;
    status: 'ok' | 'upcoming' | 'overdue';
  } | null;
  monthlyExpenses: number;
  annualExpenses: number;
  costPerKm: number | null;
  personalizedTip: Tip;
}

export function calculateVehicleOverview(
  vehicle: Vehicle,
  maintenances: MaintenanceItem[],
  expenses: Expense[],
  documents: DocumentRecord[]
): VehicleCalculatedState {
  let hasOverdue = false;
  let hasUpcoming = false;

  const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === vehicle.id);
  const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
  const vehicleDocs = documents.filter((d) => d.vehicleId === vehicle.id);

  // 1. Evaluate Maintenances Status
  let nextMaintCandidate: {
    type: string;
    detail: string;
    status: 'ok' | 'upcoming' | 'overdue';
    urgencyKm: number;
  } | null = null;

  for (const item of vehicleMaintenances) {
    if (item.isCompleted) continue;

    let itemStatus: 'ok' | 'upcoming' | 'overdue' = 'ok';
    let detailText = '';
    let remainingKm = 999999;

    if (item.nextMileageDue) {
      remainingKm = item.nextMileageDue - vehicle.currentMileage;
      if (remainingKm < 0) {
        itemStatus = 'overdue';
        detailText = `Vencido por ${Math.abs(remainingKm).toLocaleString('es-AR')} km`;
      } else if (remainingKm <= 2000) {
        itemStatus = 'upcoming';
        detailText = `Próximo en ${remainingKm.toLocaleString('es-AR')} km`;
      } else {
        detailText = `En ${remainingKm.toLocaleString('es-AR')} km`;
      }
    }

    if (item.nextDateDue && itemStatus !== 'overdue') {
      const daysLeft = getDaysDifference(item.nextDateDue);
      if (daysLeft < 0) {
        itemStatus = 'overdue';
        detailText = `Vencido hace ${Math.abs(daysLeft)} días`;
      } else if (daysLeft <= 30 && itemStatus !== 'upcoming') {
        itemStatus = 'upcoming';
        detailText = `Faltan ${daysLeft} días`;
      }
    }

    if (itemStatus === 'overdue') hasOverdue = true;
    if (itemStatus === 'upcoming') hasUpcoming = true;

    // Pick top priority maintenance for summary card
    if (
      !nextMaintCandidate ||
      (itemStatus === 'overdue' && nextMaintCandidate.status !== 'overdue') ||
      remainingKm < nextMaintCandidate.urgencyKm
    ) {
      nextMaintCandidate = {
        type: item.type,
        detail: detailText || 'Próximamente',
        status: itemStatus,
        urgencyKm: remainingKm,
      };
    }
  }

  // 2. Evaluate Document Expirations
  let nextDocCandidate: {
    title: string;
    detail: string;
    status: 'ok' | 'upcoming' | 'overdue';
    daysLeft: number;
  } | null = null;

  for (const doc of vehicleDocs) {
    const days = getDaysDifference(doc.expirationDate);
    let docStatus: 'ok' | 'upcoming' | 'overdue' = 'ok';
    let docDetail = '';

    if (days < 0) {
      docStatus = 'overdue';
      docDetail = `Vencida hace ${Math.abs(days)} días`;
      hasOverdue = true;
    } else if (days <= 30) {
      docStatus = 'upcoming';
      docDetail = days === 0 ? 'Vence HOY' : `Faltan ${days} días`;
      hasUpcoming = true;
    } else {
      docDetail = `Faltan ${days} días`;
    }

    if (!nextDocCandidate || days < nextDocCandidate.daysLeft) {
      nextDocCandidate = {
        title: doc.title || doc.type,
        detail: docDetail,
        status: docStatus,
        daysLeft: days,
      };
    }
  }

  // Determine overall status badge
  let overallStatus: OverallVehicleStatus = 'ok';
  let statusTitle = '🟢 Todo en orden';
  let statusSubtitle = 'Tu vehículo no presenta mantenimientos ni vencimientos urgentes pendientes.';

  if (hasOverdue) {
    overallStatus = 'overdue';
    statusTitle = '🔴 Tenés tareas pendientes';
    statusSubtitle = 'Hay mantenimientos o documentación vencida que requieren tu atención inmediata.';
  } else if (hasUpcoming) {
    overallStatus = 'upcoming';
    statusTitle = '🟡 Hay mantenimientos próximos';
    statusSubtitle = 'Revisá los servicios y vencimientos programados para los próximos días o kilómetros.';
  }

  // 3. Expenses calculation
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyExpenses = 0;
  let annualExpenses = 0;

  for (const exp of vehicleExpenses) {
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

  // Also sum maintenance costs into total expenses
  for (const m of vehicleMaintenances) {
    if (m.cost && m.cost > 0) {
      const mDate = new Date(m.date);
      if (!isNaN(mDate.getTime()) && mDate.getFullYear() === currentYear) {
        annualExpenses += m.cost;
        if (mDate.getMonth() === currentMonth) {
          monthlyExpenses += m.cost;
        }
      }
    }
  }

  // 4. Cost per km calculation
  // Needs at least two mileage points or total expense vs total distance
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

  // 5. Select Personalized Tip
  let personalizedTip = INITIAL_TIPS[0];
  if (vehicle.currentMileage >= 150000) {
    const highKmTip = INITIAL_TIPS.find((t) => t.category === 'motor' || t.category === 'refrigeración');
    if (highKmTip) personalizedTip = highKmTip;
  } else if (hasOverdue) {
    const maintTip = INITIAL_TIPS.find((t) => t.category === 'mantenimiento preventivo') || INITIAL_TIPS[0];
    personalizedTip = maintTip;
  } else {
    // Pick random or mileage-appropriate tip
    const matchingTip = INITIAL_TIPS.find((t) => (t.minMileage || 0) <= vehicle.currentMileage);
    if (matchingTip) personalizedTip = matchingTip;
  }

  return {
    status: overallStatus,
    statusTitle,
    statusSubtitle,
    nextMaintenance: nextMaintCandidate
      ? {
          type: nextMaintCandidate.type,
          detail: nextMaintCandidate.detail,
          status: nextMaintCandidate.status,
        }
      : null,
    nextDocument: nextDocCandidate
      ? {
          title: nextDocCandidate.title,
          detail: nextDocCandidate.detail,
          status: nextDocCandidate.status,
        }
      : null,
    monthlyExpenses,
    annualExpenses,
    costPerKm,
    personalizedTip,
  };
}
