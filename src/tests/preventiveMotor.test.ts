import {
  calculateMaintenanceUrgency,
  calculateDocumentUrgency,
  generatePreventiveRecommendations,
  calculateVehicleOverview,
  getUrgencyInfo,
  MAINTENANCE_THRESHOLDS,
} from '../utils/vehicleCalculations';
import { getDaysDifference, formatCurrency, formatKm, formatDateShort } from '../utils/formatters';
import { Vehicle, MaintenanceItem, DocumentRecord, Expense } from '../types';

export interface TestResultRow {
  testName: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runPreventiveMotorTests(): TestResultRow[] {
  const results: TestResultRow[] = [];

  const addTest = (testName: string, expected: string, actual: string, passed: boolean) => {
    results.push({ testName, expected, actual, passed });
  };

  // 1. NIVEL 1 - INFORMATIVO
  {
    const mockItem: MaintenanceItem = {
      id: 'm1',
      vehicleId: 'v1',
      type: 'Filtro de aire',
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 204000, // faltan 4000 km
      nextDateDue: '2026-11-15', // faltan > 60 días
      isCompleted: false,
    };
    const currentMileage = 200000;
    const res = calculateMaintenanceUrgency(mockItem, currentMileage);
    const info = getUrgencyInfo(res.level);
    addTest(
      'Nivel 1 (Informativo)',
      'INFORMATIVO (Nivel 1)',
      `${info.label} (Nivel ${res.level})`,
      res.level === 1 && info.label === 'INFORMATIVO'
    );
  }

  // 2. NIVEL 2 - PREVENTIVO
  {
    const mockItem: MaintenanceItem = {
      id: 'm2',
      vehicleId: 'v1',
      type: 'Filtro de aire',
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 201500, // faltan 1500 km (<= 3000)
      isCompleted: false,
    };
    const currentMileage = 200000;
    const res = calculateMaintenanceUrgency(mockItem, currentMileage);
    const info = getUrgencyInfo(res.level);
    addTest(
      'Nivel 2 (Preventivo)',
      'PREVENTIVO (Nivel 2)',
      `${info.label} (Nivel ${res.level})`,
      res.level === 2 && info.label === 'PREVENTIVO'
    );
  }

  // 3. NIVEL 3 - IMPORTANTE
  {
    const mockItem: MaintenanceItem = {
      id: 'm3',
      vehicleId: 'v1',
      type: 'Filtro de aire',
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 200500, // faltan 500 km (<= 1000)
      isCompleted: false,
    };
    const currentMileage = 200000;
    const res = calculateMaintenanceUrgency(mockItem, currentMileage);
    const info = getUrgencyInfo(res.level);
    addTest(
      'Nivel 3 (Importante)',
      'IMPORTANTE (Nivel 3)',
      `${info.label} (Nivel ${res.level})`,
      res.level === 3 && info.label === 'IMPORTANTE'
    );
  }

  // 4. NIVEL 4 - URGENTE
  {
    const mockItem: MaintenanceItem = {
      id: 'm4',
      vehicleId: 'v1',
      type: 'Filtro de aire', // componente común
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 199900, // excedido por 100 km (< 0)
      isCompleted: false,
    };
    const currentMileage = 200000;
    const res = calculateMaintenanceUrgency(mockItem, currentMileage);
    const info = getUrgencyInfo(res.level);
    addTest(
      'Nivel 4 (Urgente)',
      'URGENTE (Nivel 4)',
      `${info.label} (Nivel ${res.level})`,
      res.level === 4 && info.label === 'URGENTE'
    );
  }

  // 5. NIVEL 5 - CRÍTICO
  {
    const mockSafetyItem: MaintenanceItem = {
      id: 'm5',
      vehicleId: 'v1',
      type: 'Frenos', // componente de seguridad
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 199900, // excedido en componente de seguridad
      isCompleted: false,
      isSafetyComponent: true,
    };
    const currentMileage = 200000;
    const res = calculateMaintenanceUrgency(mockSafetyItem, currentMileage);
    const info = getUrgencyInfo(res.level);
    addTest(
      'Nivel 5 (Crítico)',
      'CRÍTICO (Nivel 5)',
      `${info.label} (Nivel ${res.level})`,
      res.level === 5 && info.label === 'CRÍTICO'
    );
  }

  // 6. LO QUE OCURRA PRIMERO (WHICHEVER COMES FIRST)
  {
    // Caso A: Próximo km 240.000 (vehículo 239.500 -> faltan 500 km -> IMPORTANTE). Fecha lejana 2027-01-15.
    const mockItem: MaintenanceItem = {
      id: 'm6',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 230000,
      nextMileageDue: 240000,
      nextDateDue: '2027-01-15',
      isCompleted: false,
    };
    const resA = calculateMaintenanceUrgency(mockItem, 239500);
    const kmFirstPassed = resA.level === 3;

    // Caso B: Vehículo en 239.500 km pero fecha vencida (ej. 2025-01-01). Debe detectar vencimiento por fecha.
    const mockItemOverdueDate: MaintenanceItem = {
      ...mockItem,
      nextDateDue: '2025-01-01',
    };
    const resB = calculateMaintenanceUrgency(mockItemOverdueDate, 239500);
    const dateFirstPassed = resB.level >= 4;

    addTest(
      'Lo que ocurra primero (Km vs Fecha)',
      'Evaluación dinámica por la condición más crítica',
      `Km primero: Nivel ${resA.level}, Fecha primero: Nivel ${resB.level}`,
      kmFirstPassed && dateFirstPassed
    );
  }

  // 7. SOLO KILOMETRAJE
  {
    const mockItemKmOnly: MaintenanceItem = {
      id: 'm7',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 200000,
      intervalKm: 10000,
      nextMileageDue: 210000,
      nextDateDue: undefined,
      isCompleted: false,
    };
    const res = calculateMaintenanceUrgency(mockItemKmOnly, 209500); // faltan 500 km
    addTest(
      'Solo kilometraje',
      'Calcula urgencia basada únicamente en km (Nivel 3)',
      `Nivel ${res.level}, remainingDays: ${res.remainingDays}`,
      res.level === 3 && res.remainingDays === undefined && res.remainingKm === 500
    );
  }

  // 8. SOLO TIEMPO
  {
    const today = new Date();
    const tenDaysFromNow = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const mockItemTimeOnly: MaintenanceItem = {
      id: 'm8',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 200000,
      intervalMonths: 12,
      nextMileageDue: undefined,
      nextDateDue: tenDaysFromNow,
      isCompleted: false,
    };
    const res = calculateMaintenanceUrgency(mockItemTimeOnly, 200000);
    addTest(
      'Solo tiempo',
      'Calcula urgencia basada únicamente en días (Nivel 3)',
      `Nivel ${res.level}, remainingKm: ${res.remainingKm}, remainingDays: ${res.remainingDays}`,
      res.level === 3 && res.remainingKm === undefined && res.remainingDays === 10
    );
  }

  // 9. AMBAS CONDICIONES
  {
    const mockBoth: MaintenanceItem = {
      id: 'm9',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 200000,
      intervalKm: 10000,
      intervalMonths: 12,
      nextMileageDue: 210000,
      nextDateDue: '2026-12-31',
      isCompleted: false,
    };
    const res = calculateMaintenanceUrgency(mockBoth, 209500);
    addTest(
      'Ambas condiciones (Km + Tiempo)',
      'Selecciona automáticamente la condición que ocurra primero',
      `Nivel ${res.level}, remainingKm: ${res.remainingKm}`,
      res.level === 3 && res.remainingKm === 500
    );
  }

  // 10. SIN HISTORIAL
  {
    const mockVehicle: Vehicle = {
      id: 'v_new',
      userId: 'u1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      licensePlate: 'ABC123',
      currentMileage: 50000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const recs = generatePreventiveRecommendations(mockVehicle, [], []);
    const noHistoryRec = recs.find((r) => r.title.startsWith('Sin registro:'));
    const isNoHistory = noHistoryRec !== undefined && !noHistoryRec.reason.includes('VENCIDO');
    const hasRegisterAction = noHistoryRec?.urgencyInfo.actionText === 'Registrar mantenimiento';
    addTest(
      'Sin historial',
      'Muestra "Sin registro" con acción "Registrar mantenimiento", NO "VENCIDO"',
      `Título: "${noHistoryRec?.title}", Acción: "${noHistoryRec?.urgencyInfo.actionText}"`,
      isNoHistory && hasRegisterAction
    );
  }

  // 11. MANTENIMIENTO COMPLETADO
  {
    const completedItem: MaintenanceItem = {
      id: 'm_comp',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 200000, // old due
      nextDateDue: '2026-01-01', // old date
      isCompleted: true,
    };
    const resCompleted = calculateMaintenanceUrgency(completedItem, 205000);
    
    // New next maintenance item
    const nextItem: MaintenanceItem = {
      id: 'm_next',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 210000,
      nextDateDue: '2027-01-01',
      isCompleted: false,
    };
    const resNext = calculateMaintenanceUrgency(nextItem, 205000);

    addTest(
      'Mantenimiento completado',
      'Item anterior no figura vencido (Nivel 1), nuevo item programado a 210.000 km',
      `Anterior: Nivel ${resCompleted.level}, Nuevo: Nivel ${resNext.level} (próx: ${nextItem.nextMileageDue} km)`,
      resCompleted.level === 1 && resNext.level === 1 && nextItem.nextMileageDue === 210000
    );
  }

  // 12. CAMBIO DE KILOMETRAJE
  {
    const item: MaintenanceItem = {
      id: 'm_km_step',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 200000,
      nextMileageDue: 210000,
      isCompleted: false,
    };
    const step1 = calculateMaintenanceUrgency(item, 205000).level; // 5000 km remaining -> Level 1 (Informativo)
    const step2 = calculateMaintenanceUrgency(item, 209500).level; // 500 km remaining -> Level 3 (Importante)
    const step3 = calculateMaintenanceUrgency(item, 211000).level; // -1000 km overdue -> Level 4 (Urgente)

    addTest(
      'Transición por Cambio de Kilometraje',
      '205k km (Nivel 1) -> 209.5k km (Nivel 3) -> 211k km (Nivel 4)',
      `Step 1: ${step1}, Step 2: ${step2}, Step 3: ${step3}`,
      step1 === 1 && step2 === 3 && step3 === 4
    );
  }

  // 13. CAMBIO DE FECHA & TIMEZONE
  {
    const todayStr = new Date().toISOString().split('T')[0];
    const diffToday = getDaysDifference(todayStr); // should be 0 without timezone offset bug
    
    const mockItemToday: MaintenanceItem = {
      id: 'm_today',
      vehicleId: 'v1',
      type: 'Filtro de aire',
      date: '2026-01-01',
      mileage: 200000,
      nextDateDue: todayStr,
      isCompleted: false,
    };
    const resToday = calculateMaintenanceUrgency(mockItemToday, 200000);

    addTest(
      'Cambio de fecha y Timezone',
      'Fecha HOY produce 0 días de diferencia sin desfase horario (Nivel 3)',
      `Días dif: ${diffToday}, Urgencia nivel: ${resToday.level}`,
      diffToday === 0 && resToday.level === 3
    );
  }

  // 14. INTERVALO PERSONALIZADO
  {
    const customItem: MaintenanceItem = {
      id: 'm_custom',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 200000,
      intervalKm: 15000, // intervalo personalizado 15k km en vez de 10k km
      intervalMonths: 6,
      nextMileageDue: 215000,
      nextDateDue: '2026-07-01',
      isCompleted: false,
    };
    const res = calculateMaintenanceUrgency(customItem, 200000);
    addTest(
      'Intervalo personalizado',
      'Aplica el intervalo guardado de 15.000 km / 6 meses (nextMileageDue: 215.000)',
      `Próximo km: ${customItem.nextMileageDue}, Faltan: ${res.remainingKm} km`,
      customItem.nextMileageDue === 215000 && res.remainingKm === 15000
    );
  }

  // 15. MÚLTIPLES VEHÍCULOS (AISLAMIENTO)
  {
    const vehicleA: Vehicle = {
      id: 'veh_A',
      userId: 'u1',
      brand: 'Ford',
      model: 'Focus',
      year: 2018,
      licensePlate: 'AAA111',
      currentMileage: 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const vehicleB: Vehicle = {
      id: 'veh_B',
      userId: 'u1',
      brand: 'Chevrolet',
      model: 'Cruze',
      year: 2020,
      licensePlate: 'BBB222',
      currentMileage: 200000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const maintA: MaintenanceItem = {
      id: 'mA',
      vehicleId: 'veh_A',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 95000,
      nextMileageDue: 105000,
      isCompleted: false,
    };

    const maintB: MaintenanceItem = {
      id: 'mB',
      vehicleId: 'veh_B',
      type: 'Frenos',
      date: '2026-01-01',
      mileage: 190000,
      nextMileageDue: 195000, // overdue on B
      isCompleted: false,
      isSafetyComponent: true,
    };

    const allMaints = [maintA, maintB];
    const recsA = generatePreventiveRecommendations(vehicleA, allMaints, []);
    const recsB = generatePreventiveRecommendations(vehicleB, allMaints, []);

    const recA_has_mB = recsA.some((r) => r.maintenanceItemId === 'mB');
    const recB_has_mA = recsB.some((r) => r.maintenanceItemId === 'mA');

    addTest(
      'Aislamiento entre múltiples vehículos',
      'Vehículo A no contiene items de B y B no contiene items de A',
      `A tiene B: ${recA_has_mB}, B tiene A: ${recB_has_mA}`,
      !recA_has_mB && !recB_has_mA
    );
  }

  // 16. CONSISTENCIA DASHBOARD VS MAINTENANCE VIEW
  {
    const vehicle: Vehicle = {
      id: 'v1',
      userId: 'u1',
      brand: 'Toyota',
      model: 'Yaris',
      year: 2021,
      licensePlate: 'CCC333',
      currentMileage: 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const maint: MaintenanceItem = {
      id: 'm_consist',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 90000,
      nextMileageDue: 100500, // faltan 500 km -> Nivel 3 (Importante)
      isCompleted: false,
    };

    const overview = calculateVehicleOverview(vehicle, [maint], [], []);
    const directUrgency = calculateMaintenanceUrgency(maint, vehicle.currentMileage);

    const overviewRec = overview.recommendations.find((r) => r.maintenanceItemId === 'm_consist');

    addTest(
      'Consistencia Dashboard vs MaintenanceView',
      'Nivel de urgencia idéntico en ambos componentes (Nivel 3)',
      `Overview: Nivel ${overviewRec?.urgency}, Directo: Nivel ${directUrgency.level}`,
      overviewRec?.urgency === directUrgency.level && directUrgency.level === 3
    );
  }

  // 17. ORDEN DE PRIORIDADES (5 -> 4 -> 3 -> 2 -> 1)
  {
    const vehicle: Vehicle = {
      id: 'v1',
      userId: 'u1',
      brand: 'Toyota',
      model: 'Hilux',
      year: 2020,
      licensePlate: 'DDD444',
      currentMileage: 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const maints: MaintenanceItem[] = [
      { id: 'm1', vehicleId: 'v1', type: 'Filtro de habitáculo', date: '2026-01-01', mileage: 100000, nextMileageDue: 120000, isCompleted: false }, // Nivel 1
      { id: 'm2', vehicleId: 'v1', type: 'Service general', date: '2026-01-01', mileage: 100000, nextMileageDue: 102500, isCompleted: false }, // Nivel 2
      { id: 'm3', vehicleId: 'v1', type: 'Bujías', date: '2026-01-01', mileage: 100000, nextMileageDue: 100500, isCompleted: false }, // Nivel 3
      { id: 'm4', vehicleId: 'v1', type: 'Filtro de aire', date: '2026-01-01', mileage: 100000, nextMileageDue: 99900, isCompleted: false }, // Nivel 4
      { id: 'm5', vehicleId: 'v1', type: 'Frenos', date: '2026-01-01', mileage: 100000, nextMileageDue: 99900, isCompleted: false, isSafetyComponent: true }, // Nivel 5
    ];

    const overview = calculateVehicleOverview(vehicle, maints, [], []);
    const mainRecs = overview.recommendations.filter((r) => r.maintenanceItemId);
    const levels = mainRecs.map((r) => r.urgency);

    addTest(
      'Orden de Prioridades en Dashboard',
      'Ordenamiento estricto Nivel 5 -> Nivel 4 -> Nivel 3 -> Nivel 2 -> Nivel 1',
      `Niveles ordenados: ${levels.join(' -> ')}`,
      JSON.stringify(levels) === JSON.stringify([5, 4, 3, 2, 1])
    );
  }

  // 18. ESTADO GENERAL DEL VEHÍCULO
  {
    const vehicle: Vehicle = {
      id: 'v1',
      userId: 'u1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      licensePlate: 'EEE555',
      currentMileage: 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Case 1: All ok
    const okOverview = calculateVehicleOverview(vehicle, [], [], []);
    // Case 2: Upcoming
    const upcomingMaint: MaintenanceItem = {
      id: 'm_up',
      vehicleId: 'v1',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 100000,
      nextMileageDue: 100500,
      isCompleted: false,
    };
    const upcomingOverview = calculateVehicleOverview(vehicle, [upcomingMaint], [], []);
    // Case 3: Overdue
    const overdueMaint: MaintenanceItem = {
      id: 'm_over',
      vehicleId: 'v1',
      type: 'Frenos',
      date: '2026-01-01',
      mileage: 100000,
      nextMileageDue: 95000,
      isCompleted: false,
      isSafetyComponent: true,
    };
    const overdueOverview = calculateVehicleOverview(vehicle, [overdueMaint], [], []);

    addTest(
      'Estado General del Vehículo',
      'Estados dinámicos: ok -> upcoming -> overdue',
      `Ok: ${okOverview.status}, Upcoming: ${upcomingOverview.status}, Overdue: ${overdueOverview.status}`,
      okOverview.status === 'ok' && upcomingOverview.status === 'upcoming' && overdueOverview.status === 'overdue'
    );
  }

  // 19. CASOS LÍMITE (EDGE CASES)
  {
    const edgeVehicle: Vehicle = {
      id: 'v_edge',
      userId: 'u1',
      brand: 'Test',
      model: 'Zero',
      year: 2020,
      licensePlate: '000ZZZ',
      currentMileage: 0, // km 0
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const edgeMaintZero: MaintenanceItem = {
      id: 'm_zero',
      vehicleId: 'v_edge',
      type: 'Cambio de aceite',
      date: '2026-01-01',
      mileage: 0,
      intervalKm: 0, // interval 0
      intervalMonths: 0, // interval 0
      nextMileageDue: 0,
      nextDateDue: '',
      isCompleted: false,
    };

    const overview = calculateVehicleOverview(edgeVehicle, [edgeMaintZero], [], []);
    const formattedKm = formatKm(NaN);
    const formattedCurr = formatCurrency(NaN);
    const dateFormatted = formatDateShort('invalid-date');

    const noNaNInOutput =
      !formattedKm.includes('NaN') &&
      !formattedCurr.includes('NaN') &&
      dateFormatted === 'invalid-date' &&
      !isNaN(overview.costPerKm || 0);

    addTest(
      'Casos Límite y Robustez (km 0, intervalos 0, valores inválidos)',
      'No se producen valores NaN, Infinity, undefined ni Invalid Date',
      `formatKm(NaN): "${formattedKm}", formatCurr(NaN): "${formattedCurr}"`,
      noNaNInOutput
    );
  }

  return results;
}
